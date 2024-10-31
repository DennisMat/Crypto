pragma solidity ^0.8.19;

import "hardhat/console.sol";
/*
 * "@balancer-labs/v2-interfaces/contracts" is refering to  "balancer-v2-monorepo/pkg/interfaces/contracts"
 */
import {IVault} from "@balancer-labs/v2-interfaces/contracts/vault/IVault.sol";
import {IFlashLoanRecipient} from "@balancer-labs/v2-interfaces/contracts/vault/IFlashLoanRecipient.sol";
import {IERC20} from "@balancer-labs/v2-interfaces/contracts/solidity-utils/openzeppelin/IERC20.sol";

//From https://docs.balancer.fi/guides/arbitrageurs/flash-loans.html#example-code
contract FlashLoanRecipient is IFlashLoanRecipient {
    IVault private constant vault =
        IVault(0xBA12222222228d8Ba445958a75a0704d566BF2C8);
        

    function makeFlashLoan(
        IERC20[] memory tokens,
        uint256[] memory amounts,
        bytes memory userData
    ) external {
        console.log( "Before flask loan ETH balance of this contract. =",  address(this).balance,  " token balance ",  tokens[0].balanceOf(address(this))   );
        vault.flashLoan(this, tokens, amounts, userData);
        console.log(" in makeFlashLoan 2");
    }

    function receiveFlashLoan(
        IERC20[] memory tokens,
        uint256[] memory amounts,
        uint256[] memory feeAmounts,
        bytes memory userData
    ) external override {
        require(msg.sender == address(vault));
    
        // This contract now has the funds requested.

        console.log( "After flask loan ETH balance of this contract. =",  address(this).balance,  " token balance ",  tokens[0].balanceOf(address(this))   );



        // Your logic goes here...

        /* 
            At the end of your logic above, this contract owes
            the flashloaned amounts + feeAmounts.
            Therefore ensure your contract has enough to repay these amounts.
        */


        // Return loan
        for (uint256 i = 0; i < tokens.length; i++) {
            tokens[i].transfer(address(vault), amounts[i] + feeAmounts[i]);           
             console.log(                "token=",                address(tokens[i]),                " amount recived= ",                amounts[i]
            );
        }
        console.log( "After returning flask loan ETH balance of this contract. =",  address(this).balance,  " token balance ",  tokens[0].balanceOf(address(this))   );
    }
}
