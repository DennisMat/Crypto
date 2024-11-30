pragma solidity ^0.8.19;

// refer to example form https://solidity-by-example.org/defi/uniswap-v2/
import "hardhat/console.sol";

import {IVault} from "@balancer-labs/v2-interfaces/contracts/vault/IVault.sol";
import {IFlashLoanRecipient} from "@balancer-labs/v2-interfaces/contracts/vault/IFlashLoanRecipient.sol";
import {IERC20} from "@balancer-labs/v2-interfaces/contracts/solidity-utils/openzeppelin/IERC20.sol";

// interface IERC20 {
//     function balanceOf(address account) external view returns (uint256);
//     function approve(address spender, uint256 amount) external returns (bool);
// }
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

    //Swaps an exact amount of input tokens for as many output tokens as possible
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    //Receive an exact amount of output tokens for as few input tokens as possible,
    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function WETH() external pure returns (address);
}

interface IWETH is IERC20 {
    function deposit() external payable;

    function withdraw(uint256 amount) external;
}

contract TransactV01 is IFlashLoanRecipient {
    address private constant SUSHISWAP_ROUTER =
        0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F;
    address private constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7; // USDT contract address on Ethereum mainnet
    address private constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address private constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address private constant IVAULT =
        0xBA12222222228d8Ba445958a75a0704d566BF2C8; // to get flash loan
    address private constant UNISWAP_V2_ROUTER =
        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address private owner;
    address private constant myBank =
        0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;

    IVault private constant balancerVault = IVault(IVAULT);
    IUniswapV2Router02 private sushiSwapRouter =
        IUniswapV2Router02(SUSHISWAP_ROUTER);
    IUniswapV2Router02 private uniswap = IUniswapV2Router02(UNISWAP_V2_ROUTER);

    constructor() {
        owner = msg.sender;
    }

    function convertAndSendWETH(address recipient) public payable {
        require(msg.value > 0, "No ETH sent");

        IWETH weth = IWETH(WETH);

        // Convert ETH to WETH
        weth.deposit{value: msg.value}();

        // Transfer WETH to recipient
        bool success = weth.transfer(recipient, msg.value);
        require(success, "WETH transfer failed");
    }

    address[] private routers;
    address private recepient;
    IERC20[] private tokens;

    function doTrans(
        address[] memory routersIncoming,
        IERC20[] memory tokensIncoming,
        address recepientIncoming,
        uint256[] memory flashLoanAmounts,
        bytes memory userData
    ) external payable {
        console.log("in doTrans ooooooooooooooooooooooooooooooooo");
        require(owner == msg.sender, "only sender can send");

        routers = routersIncoming;
        tokens = tokensIncoming;
        recepient = recepientIncoming;

        // done for testing only, remove in prod.
        IWETH(WETH).deposit{value: msg.value}();

        IERC20[] memory t1 = new IERC20[](1);
        t1[0] = IERC20(WETH);

        balancerVault.flashLoan(this, t1, flashLoanAmounts, userData);
    }

    function receiveFlashLoan(
        IERC20[] memory tokensIncoming,
        uint256[] memory flashLoanAmounts,
        uint256[] memory feeAmounts,
        bytes memory userData
    ) external override {
        require(msg.sender == address(balancerVault));

        // This contract now has the funds requested.

        console.log(
            "Received flash loan, ETH balance on this contract =",
            address(this).balance,
            " WETH token balance ",
            IERC20(uniswap.WETH()).balanceOf(address(this))
        );
        console.log("routers.length=", routers.length);
        uint256 amountIn = flashLoanAmounts[0];

        for (uint256 i = 0; i < routers.length - 1; i++) {
            uint256 amountOut = swap( //new amount in
                amountIn,
                routers[i],
                address(tokens[i]),
                address(tokens[i + 1])
            );
            console.log("============", i, "============");
            console.log("amountIn=", amountIn, "Token From=", address(tokens[i]));
            console.log("router", routers[i]);
            console.log("amountOut=",amountOut,"Token To=",address(tokens[i + 1]));

             amountIn = amountOut;
        }

        // console.log("============in final step============");
        // console.log("amountIn=", amountIn, "tokenA=",address(tokens[routers.length-1]));
        // console.log("router", routers[routers.length - 1]);
        // console.log( "tokenB=", address(tokens[0]));

        uint256 finalAmountOut = swap(
            amountIn,
            routers[routers.length - 1],
            address(tokens[routers.length-1]),
            address(tokens[routers.length]) 
        );


    console.log("============in final step============");
        console.log("amountIn=", amountIn, "tokenA=", address(tokens[routers.length-1]));
        console.log("router", routers[routers.length - 1]);
        console.log("amountOut=", finalAmountOut,  "tokenB=", address(tokens[0]));

        /*
        //This contract now has WETH eqivalent to flashLoanAmounts[0]

        // console.log(
        //     "This contract now has, (expected 2 WETH) = ",
        //     IERC20(uniswap.WETH()).balanceOf(address(this)),
        //     "myBank balance (expected 0 ETH)= ",
        //     IERC20(uniswap.WETH()).balanceOf(myBank)
        // );
        address tokenA = WETH;
        address tokenB = address(tokens[1]);
        if (tokens[0] != IERC20(uniswap.WETH())) {
            tokenB = address(tokens[0]);
        }

        console.log("routers=", routers[0]);
        uint256 amountout1 = swap(
            flashLoanAmounts[0],
            routers[0],
            tokenA,
            tokenB
        );
        console.log("amountout1=", amountout1);

        if (tokens[0] != IERC20(uniswap.WETH())) {
            tokenA = address(tokens[0]);
            tokenB = address(tokens[1]);
        } else {}

        uint256 amountout2 = swap(amountout1, routers[1], tokenA, tokenB);
        console.log("amountout2=", amountout2);

*/
        //uint256[] memory  amountsU =swap(amountsS[1], uniswap, USDC,  uniswap.WETH(), "USDC", "WETH" );

        /*
        console.log("Fees=", feeAmounts[0]);
        if (finalWETH > (flashLoanAmounts[0] + feeAmounts[0])) {
            uint256 profit = finalWETH - (flashLoanAmounts[0] + feeAmounts[0]);
            console.log("WETH profit=", profit);

            //transfer half of the flash loan to another address:
            IERC20(uniswap.WETH()).transferFrom(
                address(this),
                myBank,
                flashLoanAmounts[0] / 2
            );

            console.log(
                "This contract now has,(expected 1.5 WETH)= ",
                IERC20(uniswap.WETH()).balanceOf(address(this)),
                "myBank balance (expected 0.5 ETH) after transfer = ",
                IERC20(uniswap.WETH()).balanceOf(myBank)
            );
        } else {
            uint256 loss = flashLoanAmounts[0] + feeAmounts[0] - finalWETH;
            console.log("WETH loss=", loss);
        }
*/
        // Return loan
        for (uint256 i = 0; i < tokensIncoming.length; i++) {
            tokensIncoming[i].transfer(
                address(balancerVault),
                flashLoanAmounts[i] + feeAmounts[i]
            );
            console.log(
                "token=",
                address(tokensIncoming[i]),
                " amount returned= ",
                flashLoanAmounts[i]
            );
        }
        console.log(
            "After returning flask loan ETH balance of this contract. =",
            address(this).balance,
            " token balance =",
            tokensIncoming[0].balanceOf(address(this))
        );
    }

    function swap(
        uint256 amountForSwapping,
        address router,
        address tokenA,
        address tokenB
    ) internal returns (uint256) {
        uint256 amountOut = 0;
        IERC20 ta = IERC20(tokenA);
        if (router == UNISWAP_V2_ROUTER || router == SUSHISWAP_ROUTER) {
            IUniswapV2Router02 swapRouter = IUniswapV2Router02(router);
            ta.approve(address(swapRouter), amountForSwapping);

            address[] memory path = new address[](2);
            path[0] = tokenA;
            path[1] = tokenB; // Recieve tokenB

            uint256[] memory amounts = swapRouter.swapExactTokensForTokens(
                amountForSwapping,
                0, //amountIn, amountOutMin,
                path,
                address(this), // recipient of tokenB
                block.timestamp + 300 // transaction deadline (300 seconds from now)
            );

            //  IERC20  ta = IERC20(WETH);
            //     ta.approve(UNISWAP_V2_ROUTER, amountForSwapping);
            //     address[] memory path = new address[](2);
            //         path[0] = tokenA;
            //         path[1] = tokenB; // Recieve tokenB

            //     uint256[] memory amounts  =  uniswap.swapExactTokensForTokens(
            //             amountForSwapping,0,  //amountIn, amountOutMin,
            //             path,
            //             address(this),  // recipient of tokenB
            //             block.timestamp + 300  // transaction deadline (300 seconds from now)
            //     );

            amountOut = amounts[1];
        } //else if (router == SUSHISWAP_ROUTER) {}

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
