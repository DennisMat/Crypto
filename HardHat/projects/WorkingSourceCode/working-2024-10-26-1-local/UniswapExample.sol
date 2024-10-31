pragma solidity ^0.8.19;

interface IUniswap {
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

contract UniswapExample {
  IUniswap uniswap;
  address private constant UNISWAP_V2_ROUTER =         0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
  
  constructor() {
    uniswap = IUniswap(UNISWAP_V2_ROUTER);
  }

  function swapExactETHForTokens(uint amountOutMin, address token) external payable {
    address[] memory path = new address[](2);
    path[0] = uniswap.WETH();
    path[1] = token;
    uniswap.swapExactETHForTokens{value: msg.value}(
      amountOutMin, 
      path,
      msg.sender,
      block.timestamp + 15
    );
  }
}