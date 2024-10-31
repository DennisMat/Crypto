// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/utils/Strings.sol";

interface IUniswapV2Router {
    function swapExactETHForTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable returns (uint[] memory amounts);

    function swapExactTokensForETH(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function WETH() external pure returns (address);
}

interface IERC20 {
    function approve(address spender, uint amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint amount) external returns (bool);
}

contract Counter {
    uint256 public count;
    address private constant UNISWAP_V2_ROUTER =0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008;
    IUniswapV2Router public uniswapRouter;

 constructor() {
        uniswapRouter = IUniswapV2Router(UNISWAP_V2_ROUTER);
    }
    // Function to get the current count
    function getYY() public view returns (uint256) {
        return count;
    }

        function getSender() public view  returns (string memory) {
        //msg.sender.balance
        return string(abi.encodePacked("The sender is: dennis version 2 :", " ",addressToString(msg.sender)));
    }

    function addressToString(address _addr) internal pure returns (string memory) {
        bytes memory addressBytes = abi.encodePacked(_addr);
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(2 + addressBytes.length * 2);
        str[0] = '0';
        str[1] = 'x';

        for (uint256 i = 0; i < addressBytes.length; i++) {
            str[2 + i * 2] = alphabet[uint8(addressBytes[i] >> 4)];
            str[3 + i * 2] = alphabet[uint8(addressBytes[i] & 0x0f)];
        }

        return string(str);
    }
    // Function to increment count by 1
    function incX() public {
        count += 1;
    }

    // Function to decrement count by 1
    function decX() public {
        // This function will fail if count = 0
        count -= 1;
    }

    function buyETHTokenUsingETH(address token, uint amountOutMin) external payable {
        // Define the path of the swap (ETH -> WETH -> Token)

        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH(); // WETH address, as Uniswap swaps via WETH
        path[1] = token; // Target token

        // Set a deadline to prevent a stuck transaction
        uint deadline = block.timestamp + 15; // 15 seconds from the current block time

        // Perform the swap
        uniswapRouter.swapExactETHForTokens{ value: msg.value }(
            amountOutMin,
            path,
            msg.sender,
            deadline
        );
    }


    function sellETHTokenToGetETH(address token, uint amountIn, uint amountOutMin) external {
        // Transfer the tokens from the caller to this contract
       address[] memory path = new address[](2);
        IERC20(token).transferFrom(msg.sender, address(this), amountIn);

        // Approve the Uniswap router to spend the specified amount of tokens
        IERC20(token).approve(UNISWAP_V2_ROUTER, amountIn);

        // Define the path of the swap (Token -> WETH -> ETH)
        path[0] = token;
        path[1] = uniswapRouter.WETH(); // WETH to ETH conversion happens in Uniswap internally

        // Set a deadline to prevent the transaction from hanging
        uint deadline = block.timestamp + 15; // 15 seconds from the current block time

        // Perform the swap, sending the ETH output to msg.sender
        uniswapRouter.swapExactTokensForETH(
            amountIn,
            amountOutMin,
            path,
            msg.sender,
            deadline
        );

    }


        // Function to transfer Ether from the contract to a specific address
    function transferEther(address payable recipient, uint256 amount) public {
        // Ensure the contract has enough balance
        require(address(this).balance >= amount, "Insufficient balance in contract");

        // Transfer the amount to the recipient
        recipient.transfer(amount);
    }


    // Fallback function to allow contract to receive ETH
    receive() external payable {
    }




}
