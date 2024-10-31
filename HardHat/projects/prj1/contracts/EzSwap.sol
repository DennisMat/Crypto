// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.7;

// from https://stackoverflow.com/questions/76750964/error-when-interacting-with-eth-in-uniswap-functions-swapexactethfortokens-swa
interface IUniswap {
    function swapExactTokensForETH(
        uint amountIn, 
        uint amountOutMin, 
        address[] calldata path, 
        address to, 
        uint deadline)
    external
    returns (uint[] memory amounts);
    
    function swapExactETHForTokens(
            uint amountOutMin, 
            address[] calldata path, 
            address to, 
            uint deadline)
        external
        payable
    returns (uint[] memory amounts);
    
    function WETH() external pure returns (address);
}

interface IERC20 {
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
    
    function approve(address spender, uint256 amount) external returns (bool);
}

contract EzSwap {
    IUniswap uniswap;
    address private constant UNISWAP_V2_ROUTER =0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008;// sepolia
    //address private constant UNISWAP_V2_ROUTER =0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;// mainnet
    
    constructor() {
        uniswap = IUniswap(UNISWAP_V2_ROUTER);
    }
    
    function swapExactETHForTokens(
        address token,
        uint amountOutMin) external payable {
             uint256 deadline = block.timestamp + 15; // Using 'now' for convenience, for a deadline of 15 seconds

            address[] memory path = new address[](2);
            path[0] = uniswap.WETH();
            path[1] = token;
            
            uniswap.swapExactETHForTokens{value: msg.value}(
                amountOutMin,
                path,
                msg.sender,
                deadline);
    }
        
    // uniswap address 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
    function swapTokensForETH(
        address token, 
        uint amountIn, 
        uint amountOutMin, 
        uint deadline) external {
            IERC20(token).transferFrom(msg.sender, address(this), amountIn);
            address[] memory path = new address[](2);
            path[0] = token;
            path[1] = uniswap.WETH();
            IERC20(token).approve(address(uniswap), amountIn);
            uniswap.swapExactTokensForETH(amountIn, amountOutMin, path, msg.sender, deadline);
    }
}