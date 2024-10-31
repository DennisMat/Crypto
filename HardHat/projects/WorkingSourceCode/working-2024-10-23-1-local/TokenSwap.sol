// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "hardhat/console.sol";

interface IUniswapV2Router02 {
    function swapExactTokensForETH(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function swapExactETHForTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable returns (uint[] memory amounts);

    function WETH() external pure returns (address);
}

interface IERC20 {
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);

    function balanceOf(address account) external view returns (uint256);
}

interface IWETH {
    function deposit() external payable;

    function transfer(address to, uint value) external returns (bool);

    function withdraw(uint256 value) external payable;
}

contract TokenSwap {
    address private owner;
    IUniswapV2Router02 public uniswapRouter;
    //from  https://docs.uniswap.org/contracts/v2/reference/smart-contracts/v2-deployments
   //abi address private constant UNISWAP_V2_ROUTER =        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D; // mainnet
    address private constant UNISWAP_V2_ROUTER = 0x53544492C78D478294B5b1Fb8059a5D6C9aBBC67;//sepolia

    /* below 3 values For ref only:
    Note uniswapRouter.WETH() works out to be 0xC02a...
    */
    address private constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address private constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

    constructor() {
        owner = msg.sender;
        uniswapRouter = IUniswapV2Router02(UNISWAP_V2_ROUTER);
    }

    event debug(string mess, address add);
    event debugInt(uint256 amountOut);
    event debugString(string mess);

    /*
     *  The below method uses less gas than the method below it.
     */
    function buyTokensWithETHLessGas() external payable {
        IWETH(WETH).deposit{value: msg.value}(); //This also uses Uniswap.
        console.log("msg.value = ", msg.value, " ETH exchanged for tokens");
    }

    /*
    Use method above because it uses less gas. This one uses more gas
    */
    function buyTokensWithETHMoreGas(
        address tokenSourceAddress,
        uint tokenAmountOutMin
    ) external payable {
        //require(msg.value > 0, "You must send some ETH"  );
        console.log("uniswapRouter.WETH() = :", uniswapRouter.WETH());
        emit debug("uniswapRouter.WETH() = ", uniswapRouter.WETH());
        uint256 deadline = block.timestamp + 15; // Using 'now' for convenience, for a deadline of 15 seconds
        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH(); //router pair address
        path[1] = tokenSourceAddress; //This is the token pool that the router takes it from.
        //path[1] = uniswapRouter.WETH();

        // Approve the Uniswap V2 Router to spend the sender's ETH
        IERC20(uniswapRouter.WETH()).approve(UNISWAP_V2_ROUTER, msg.value);

        // Execute the swap on Uniswap
        ///uint[] memory amounts = uniswapRouter.swapExactETHForTokens{
        uniswapRouter.swapExactETHForTokens{value: msg.value}( // get tokens eqivalent to msg.value. It can be any number
            tokenAmountOutMin,
            path,
            msg.sender, // Send the tokens to the buyer or recipient of token.
            deadline
        );

        //console.log("amount of tokens bought=", amounts[0], " ", amounts[1]); // Log the amount of tokens bought

        console.log("========================================================");
    }

    //not working
    function recieveETHForTokensLessGas() external payable {
        console.log("in recieveETHForTokensLessGas msg.value = ", msg.value);
        IWETH(WETH).withdraw(msg.value); //This also uses Uniswap.
        console.log("msg.value = ", msg.value, " Tokens  exchanged for ETH");
    }

    function recieveETHForTokensFullVersion(
        address tokenSourceAddress,
        uint tokenAmountOut,
        uint ethAmountInMin
    ) public {
        console.log("in recieveETHForTokens");
        uint256 deadline = block.timestamp + 15; // Using 'now' for convenience, for a deadline of 15 seconds

        IERC20(tokenSourceAddress).approve(UNISWAP_V2_ROUTER, tokenAmountOut);
        address[] memory path = new address[](2);
        path[0] = tokenSourceAddress;
        path[1] = uniswapRouter.WETH();
        uint[] memory amounts = uniswapRouter.swapExactTokensForETH(
            tokenAmountOut,
            ethAmountInMin,
            path,
            msg.sender,
            deadline
        );
        emit debugString("done swapping token for ETH");
        console.log(
            "ETH received = ",
            amounts[0],
            " Tokens  exchanged for ETH"
        );
    }

    event Deposit(string mess, address indexed _from, uint _value);

    function deposit() external payable {
        // This function accepts Ether
        require(msg.value > 0, "Send some ether");
        emit Deposit("deposit called...", msg.sender, msg.value);
    }

    function getSender() public view returns (string memory) {
        //msg.sender.balance
        return
            string(
                abi.encodePacked(
                    "The sender is: dennis :",
                    " ",
                    addressToString(msg.sender)
                )
            );
    }

    function addressToString(
        address _addr
    ) internal pure returns (string memory) {
        bytes memory addressBytes = abi.encodePacked(_addr);
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(2 + addressBytes.length * 2);
        str[0] = "0";
        str[1] = "x";

        for (uint256 i = 0; i < addressBytes.length; i++) {
            str[2 + i * 2] = alphabet[uint8(addressBytes[i] >> 4)];
            str[3 + i * 2] = alphabet[uint8(addressBytes[i] & 0x0f)];
        }

        return string(str);
    }

    // Fallback function to receive ETH
    receive() external payable {}
}
