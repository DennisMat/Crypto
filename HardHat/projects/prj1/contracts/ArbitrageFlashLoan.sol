// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// from https://www.reddit.com/r/ethdev/comments/1bvsqph/i_have_no_idea_how_to_troubleshoot_this_execution/

   interface IAaveLendingPool {
    function deposit(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;

    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external;

    function getReservesList() external view returns (address[] memory);
}

interface IUniswapV2Router02 {
    function swapExactETHForTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable returns (uint[] memory amounts);
    function swapExactTokensForTokens(
  uint amountIn,
  uint amountOutMin,
  address[] calldata path,
  address to,
  uint deadline
) external returns (uint[] memory amounts);
}

contract ArbitrageFlashLoan {

    address public constant AAVE_LENDING_POOL_ADDRESS = 0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9; 
    address public uniswapV2Router;
    address public token0;
    address public token1;
    uint256 public fee;
    address private uniswapV2RouterAddress = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address private sushiswapRouterAddress = 0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506;

    struct TradeInstruction {
        address arbPair;
        bool startOnUniswap;
        address inputToken;
        address outputToken;
        uint256 amountIn;
        uint256 amountOut;
    }

    IAaveLendingPool public lendingPool;

    constructor() {

        fee = 90; 
        lendingPool = IAaveLendingPool(AAVE_LENDING_POOL_ADDRESS);
    
    }

    event Test(uint256[] amount);

    function executeSwaps(TradeInstruction[] calldata tradeInstructions) external {

        // Initialize dynamic array in storage
        TradeInstruction[] memory instructions = new TradeInstruction[](tradeInstructions.length);

        // Copy tradeInstructions into instructions
        for (uint256 i = 0; i < tradeInstructions.length; i++) {
            instructions[i] = tradeInstructions[i];
        }

        // Loop through each trade instruction
        for (uint256 i = 0; i < tradeInstructions.length; i++) {

        // Select router based on trade instruction
            address routerAddress = tradeInstructions[i].startOnUniswap ? uniswapV2RouterAddress : sushiswapRouterAddress;

            IUniswapV2Router02 router = IUniswapV2Router02(routerAddress);

            address[] memory path = new address[](2);
            path[0] = tradeInstructions[i].inputToken;
            path[1] = tradeInstructions[i].outputToken;

            uint256 amountIn = i > 0 ? instructions[i - 1].amountOut : instructions[i].amountIn;

            //BREAKING HERE ---v

            uint256[] memory amounts = router.swapExactTokensForTokens(
                amountIn,
                instructions[i].amountOut,
                path,
                address(this),
                block.timestamp
            );

            instructions[i].amountOut = amounts[1];

            emit Test(amounts);
        }
    }
}