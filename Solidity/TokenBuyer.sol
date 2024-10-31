// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
//import "@uniswap/v2-periphery/contracts/interfaces/IERC20.sol";

interface IUniswapV2Router02 {
    function swapExactETHForTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable returns (uint[] memory amounts);
}

contract TokenSwap {
    address private owner;
    IUniswapV2Router02 public uniswapRouter;
    address private constant UNISWAP_V2_ROUTER =0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008;
    address public tokenAddress=0x7d2774A3032423841eDAF701e343c051D4d0CA1F;  // Address of the token to buy
    //address public tokenAddress=0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;
 
    
    event TokensBought(uint256 amountOut);

    constructor() {
        //owner = msg.sender;
        uniswapRouter = IUniswapV2Router02(UNISWAP_V2_ROUTER);

    }

    // Function to buy token using 0.5 ETH
    function buyTokensWithETH() external payable {
        //require(msg.value == 0.5 ether, "You must send exactly 0.5 ETH");

        uint256 deadline = block.timestamp + 15; // Using 'now' for convenience, for a deadline of 15 seconds
        address[] memory path = new address[](2);
        path[0] = UNISWAP_V2_ROUTER;
        path[1] = tokenAddress;

        // Execute the swap on Uniswap
        uint[] memory amounts = uniswapRouter.swapExactETHForTokens{value: 0.00000001 ether}(
            0, // Accept any amount of Tokens
            path,
            msg.sender, // Send the tokens to the buyer or recipient of token.
            deadline
        );

        emit TokensBought(amounts[0]); // Log the amount of tokens bought
    }

    // Fallback function to receive ETH
    receive() external payable {}
}
