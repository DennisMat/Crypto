pragma solidity ^0.8.19;

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

contract SushiSwapExample {
    address private constant SUSHISWAP_ROUTER = 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F;
    address private constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7; // USDT contract address on Ethereum mainnet

    IUniswapV2Router02 private sushiSwapRouter;

    constructor() {
        sushiSwapRouter = IUniswapV2Router02(SUSHISWAP_ROUTER);
    }
 
    function swapExactETHForTokens(uint256 amountOutMin, address token) external payable {
        require(msg.value > 0, "Send ETH to swap");

        address[] memory path = new address[](2);
        path[0] = sushiSwapRouter.WETH(); // WETH address
        path[1] = token;

        sushiSwapRouter.swapExactETHForTokens{ value: msg.value }(
            amountOutMin,  // minimum amount of USDT to receive
            path,
            msg.sender,  // recipient of USDT
            block.timestamp + 300  // transaction deadline (300 seconds from now)
        );
    }
}
