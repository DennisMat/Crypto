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
    address private constant SUSHISWAP_ROUTER = 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F;
    address private constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7; // USDT contract address on Ethereum mainnet
    address private constant USDC =0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address private constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address private constant IVAULT=0xBA12222222228d8Ba445958a75a0704d566BF2C8;// to get flash loan
    address private constant UNISWAP_V2_ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address private owner;
    address private constant myBank=0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;


 
    IVault private constant vault = IVault(IVAULT);
    IUniswapV2Router02 private sushiSwapRouter=IUniswapV2Router02(SUSHISWAP_ROUTER);
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

    function doTrans(address[] memory routers, IERC20[] memory tokens, address recepient, uint256 flashAmount) external  payable   {
        console.log("in doTrans ooooooooooooooooooooooooooooooooo");
         require(owner ==msg.sender, "only sender can send");

    }     

    function makeFlashLoan(
        IERC20[] memory tokens,
        uint256[] memory amounts,
        bytes memory userData
    ) external {
        console.log( "Before flask loan ETH balance of this contract =",  address(this).balance,  " token balance ",  tokens[0].balanceOf(address(this))   );
        vault.flashLoan(this, tokens, amounts, userData);
  
    }

    function makeFlashLoanTestOnly (
        IERC20[] memory tokens,
        uint256[] memory amounts,
        bytes memory userData
    ) external  payable {
        require(msg.value > 0, "Send some ether");

        console.log( "Before flask loan ETH balance of this contract =",  address(this).balance,  " WETH token balance ( expected 0 ) ",  tokens[0].balanceOf(address(this))   );
        IWETH(uniswap.WETH()).deposit{value: msg.value}(); //This contact now has tokens. The ETH is swapped with WETH
        console.log("msg.value = ", msg.value, " ETH exchanged for tokens");

        console.log( "Before flask loan ETH balance of this contract =",  address(this).balance,  " WETH token balance ( expected 1 ) ",  tokens[0].balanceOf(address(this))   );
        vault.flashLoan(this, tokens, amounts, userData);
  
    }


    function receiveFlashLoan(
        IERC20[] memory tokens,
        uint256[] memory flashLoanAmounts,
        uint256[] memory feeAmounts,
        bytes memory userData
    ) external override {
        require(msg.sender == address(vault));
    
        // This contract now has the funds requested.

        console.log( "Received flash loan, ETH balance on this contract =",  address(this).balance,  " WETH token balance (expected 2 ETH) ",  tokens[0].balanceOf(address(this)));
        //This contract now has WETH eqivalent to flashLoanAmounts[0]
        
        

   
    console.log( "This contract now has, (expected 2 WETH) = ", IERC20(uniswap.WETH()).balanceOf(address(this)), "myBank balance (expected 0 ETH)= ", IERC20(uniswap.WETH()).balanceOf(myBank)   );
    //transfer half of the flash loan to another address:
    IERC20(uniswap.WETH()).transferFrom(address(this), myBank,flashLoanAmounts[0]/2);
    console.log( "This contract now has,(expected 1.5 WETH)= ", IERC20(uniswap.WETH()).balanceOf(address(this)), "myBank balance (expected 0.5 ETH) after transfer = ", IERC20(uniswap.WETH()).balanceOf(myBank)   );



    uint256[] memory  amountsU =swap(flashLoanAmounts[0], uniswap,  uniswap.WETH(), USDC, "WETH", "USDC" );
    uint256[] memory amountsS =swap(amountsU[1], sushiSwapRouter,  USDC, sushiSwapRouter.WETH(),"USDC", "WETH" );
    //uint256[] memory amountsS =swap(flashLoanAmounts[0], sushiSwapRouter,  sushiSwapRouter.WETH() ,USDC,"WETH", "USDC" );
    //uint256[] memory  amountsU =swap(amountsS[1], uniswap, USDC,  uniswap.WETH(), "USDC", "WETH" );
    
    uint256 finalWETH=amountsS[1];


        console.log( "Fees=", feeAmounts[0]);
            if(finalWETH> (flashLoanAmounts[0] + feeAmounts[0])){ 
            uint256 profit=finalWETH- (flashLoanAmounts[0] + feeAmounts[0]);
                    console.log( "WETH profit=", profit);
            }else{
                uint256 loss=flashLoanAmounts[0] + feeAmounts[0]- finalWETH;
                    console.log( "WETH loss=", loss);
            }
        
        // Return loan
        for (uint256 i = 0; i < tokens.length; i++) {
            tokens[i].transfer(address(vault), flashLoanAmounts[i] + feeAmounts[i]);           
             console.log( "token=",address(tokens[i]),  " amount returned= ",  flashLoanAmounts[i]
            );
        }
        console.log( "After returning flask loan ETH balance of this contract. =",  address(this).balance,  " token balance (1.5 - loss) ",  tokens[0].balanceOf(address(this))   );
    }


           function safeApprove(address token, address router, uint256 amount) internal {
        // Low-level call to bypass return value checking for non-standard tokens
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(
            IERC20.approve.selector,
            router,
            amount
        ));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Approve failed");
        console.log( " Approve succeeded");
    }

    function approveUSDT(address router, uint256 usdtAmount) internal {
        // Use safeApprove to approve USDT
        safeApprove(USDT, router, usdtAmount);
    }


    function swap(uint256 amountForSwapping, IUniswapV2Router02 router,  address tokenA, address tokenB, string memory nameTokenA, string  memory nameTokenB )internal returns (uint[]  memory){

        console.log( "In swap", nameTokenA ,"=>", nameTokenB);
        IERC20  ta = IERC20(tokenA);
        ta.approve(address(router), amountForSwapping);
        address[] memory path = new address[](2);
            path[0] = tokenA;
            path[1] = tokenB; // Recieve tokenB

        uint256[] memory amounts  =  router.swapExactTokensForTokens(
                amountForSwapping,0,  //amountIn, amountOutMin,
                path,
                address(this),  // recipient of tokenB
                block.timestamp + 300  // transaction deadline (300 seconds from now)
        );

        console.log( "amounts[0](put in ",nameTokenA, ") =",amounts[0]);
        console.log("amounts[1] (received",nameTokenB,")=",amounts[1]);
        console.log( nameTokenA," token balance=",  ta.balanceOf(address(this)));
        console.log( nameTokenB, ", token balance ",  IERC20(tokenB).balanceOf(address(this))  );
        
        return amounts;
    }

}
