pragma solidity ^0.8.19;

import "hardhat/console.sol";

import {IVault} from "@balancer-labs/v2-interfaces/contracts/vault/IVault.sol";
import {IFlashLoanRecipient} from "@balancer-labs/v2-interfaces/contracts/vault/IFlashLoanRecipient.sol";
import {IERC20} from "@balancer-labs/v2-interfaces/contracts/solidity-utils/openzeppelin/IERC20.sol";
import {ISwapRouter} from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

interface IUniswapV2Router02 {
    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts);

    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts);

    //Swaps an exact amount of input tokens for as many output tokens as possible
    function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint256[] memory amounts);

    //Receive an exact amount of output tokens for as few input tokens as possible,
    function swapTokensForExactTokens(uint256 amountOut, uint256 amountInMax, address[] calldata path, address to, uint256 deadline) external returns (uint256[] memory amounts);

    function WETH() external pure returns (address);
}

interface IWETH is IERC20 {
    function deposit() external payable;

    function withdraw(uint256 amount) external;
}

contract TransactV01 is IFlashLoanRecipient {
    address private constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7; // USDT contract address on Ethereum mainnet
    address private constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address private constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address private constant IVAULT = 0xBA12222222228d8Ba445958a75a0704d566BF2C8; // to get flash loan
    address private constant SUSHISWAP_ROUTER = 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F;
    address private constant UNISWAP_V2_ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address private constant UNISWAP_V3_ROUTER = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
    address private owner;

    IVault private constant balancerVault = IVault(IVAULT);
    IUniswapV2Router02 private sushiSwapRouter = IUniswapV2Router02(SUSHISWAP_ROUTER);
    IUniswapV2Router02 private uniswap = IUniswapV2Router02(UNISWAP_V2_ROUTER);

    constructor() {
        owner = msg.sender;
    }


    function convertAndSendWETH(address recipient) public payable {
        require(owner == msg.sender, "only sender can send");
        require(msg.value > 0, "No ETH sent");
        IWETH weth = IWETH(WETH);
        // Convert ETH to WETH
        weth.deposit{value: msg.value}();


        // Transfer WETH to recipient, we also add any weth that is residual in the contract to be sent.
        bool success = weth.transfer(recipient, msg.value + address(this).balance);
        require(success, "WETH transfer failed");
    }

    address[] private routers;
    address private recepient;
    IERC20[] private tokens;
    uint24 maxPoolFee;

    function doTrans(address[] memory routersIncoming, IERC20[] memory tokensIncoming, address recepientIncoming, uint256[] memory flashLoanAmounts, uint24 maxPoolFeeIncoming, bytes memory userData) external payable {
        console.log("in doTrans ooooooooooooooooooooooooooooooooo");
        require(owner == msg.sender, "only sender can send");

        routers = routersIncoming;
        tokens = tokensIncoming;
        recepient = recepientIncoming;
        maxPoolFee = maxPoolFeeIncoming;

        // done for testing only, remove in prod.
        IWETH(WETH).deposit{value: msg.value}();

        IERC20[] memory t1 = new IERC20[](1);
        t1[0] = IERC20(WETH);

        balancerVault.flashLoan(this, t1, flashLoanAmounts, userData);
    }

    function receiveFlashLoan(IERC20[] memory tokensIncoming, uint256[] memory flashLoanAmounts, uint256[] memory feeAmounts, bytes memory userData) external override {
        require(msg.sender == address(balancerVault));

        // This contract now has the funds requested.

        console.log("Received flash loan, ETH balance on this contract =", address(this).balance, " WETH token balance ", IERC20(uniswap.WETH()).balanceOf(address(this)));
        console.log("routers.length=", routers.length);
        uint256 amountIn = flashLoanAmounts[0];

        for (uint256 i = 0; i < routers.length - 1; i++) {
            uint256 amountOut = swap(amountIn, routers[i], address(tokens[i]), address(tokens[i + 1])); //new amount in
            console.log("============", i, "============");
            console.log("amountIn=", amountIn, "Token From=", address(tokens[i]));
            console.log("router", routers[i]);
            console.log("amountOut=", amountOut, "Token To=", address(tokens[i + 1]));

            amountIn = amountOut;
        }

        uint256 finalAmountOut = swap(amountIn, routers[routers.length - 1], address(tokens[routers.length - 1]), address(tokens[routers.length]));

        console.log("============in final step============");
        console.log("amountIn=", amountIn, "token From=", address(tokens[routers.length - 1]));
        console.log("router", routers[routers.length - 1]);
        console.log("finalAmountOut=", finalAmountOut, "token From=", address(tokens[0]));

        if (finalAmountOut > (flashLoanAmounts[0] + feeAmounts[0])) {
            uint256 profit = finalAmountOut - (flashLoanAmounts[0] + feeAmounts[0]);
            console.log("WETH profit=", profit);
            IWETH(WETH).transfer(recepient, finalAmountOut);
        } else {
            uint256 loss = flashLoanAmounts[0] + feeAmounts[0] - finalAmountOut;
            console.log("WETH loss=", loss);
            IWETH(WETH).transfer(recepient, loss);
            console.log(loss, "WETH transferred to", recepient);
        }

        // Return loan
        for (uint256 i = 0; i < tokensIncoming.length; i++) {
            tokensIncoming[i].transfer(address(balancerVault), flashLoanAmounts[i] + feeAmounts[i]);
            console.log("token=", address(tokensIncoming[i]), " amount returned= ", flashLoanAmounts[i]);
        }
        console.log("After returning flask loan ETH balance of this contract has =", address(this).balance, " ETH. WETH token balance =", tokensIncoming[0].balanceOf(address(this)));
    }

    function swap(uint256 amountForSwapping, address router, address tokenIn, address tokenOut) internal returns (uint256) {
        uint256 amountOut = 0;
        IERC20 ta = IERC20(tokenIn);
        if (router == UNISWAP_V2_ROUTER || router == SUSHISWAP_ROUTER) {
            IUniswapV2Router02 swapRouter = IUniswapV2Router02(router);
            ta.approve(address(swapRouter), amountForSwapping);

            address[] memory path = new address[](2);
            path[0] = tokenIn;
            path[1] = tokenOut; // Recieve tokenOut

            uint256[] memory amounts = swapRouter.swapExactTokensForTokens(
                amountForSwapping,
                0, //amountIn, amountOutMin,
                path,
                address(this), // recipient of tokenOut
                block.timestamp + 300 // transaction deadline (300 seconds from now)
            );

            amountOut = amounts[1];
        } else if (router == UNISWAP_V3_ROUTER) {
            ISwapRouter swapRouter = ISwapRouter(router);
            IERC20(tokenIn).approve(address(swapRouter), amountForSwapping);
            ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: maxPoolFee,
                recipient: address(this),
                deadline: block.timestamp + 15, // 15 seconds deadline
                amountIn: amountForSwapping,
                amountOutMinimum: 0, // Slippage tolerance: set to your preference
                sqrtPriceLimitX96: 0 // No price limit
            });

            // Execute the swap
            amountOut = swapRouter.exactInputSingle(params);
        }

        // console.log("amount put in ", tokenA, ") =", amountForSwapping);
        // console.log("amount received", tokenB, ")=", amountOut);
        // console.log(tokenA, " token balance=", ta.balanceOf(address(this)));
        // console.log(
        //     tokenB,
        //     ", token balance ",
        //     IERC20(tokenB).balanceOf(address(this))
        // );

        return amountOut;
    }
}
