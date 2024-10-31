async function main() {
    const { expect, assert } = require("chai");

    const util = require("./util.js");
    const config = require("./config.local.json");
    console.log("Loaded config... env = " + config.env);


    
    const deployedContractAddress = "0x427EE58a6c574032085AEB90Dd05dEea6F054930";
    //const deployedContractAddress = await util.deploy("FlashLoanRecipient");

    const provider = new ethers.JsonRpcProvider(config.providerUrl);
    const tokenToBeReceived = config.DAI;

    //await util.getTokenBalances(config, provider,config.payerAccount );

    await executeFlashLoan(config, provider, util, config.priKeyPayer, deployedContractAddress);

     //await util.getTokenBalances(config, provider,config.payerAccount );


}




async function executeFlashLoan(config, provider, util, priKeyPayer, deployedContractAddress) {

    const tokenToBeReceived = config.DAI; // Replace with desired token address (e.g., DAI)
    const loanAmount = ethers.parseUnits("30", "ether");

    const ERC20ABI = require('./ERC20.json');
    const { abi, bytecode } = require("../artifacts/contracts/FlashLoanRecipient.sol/FlashLoanRecipient.json");

    const tokens = [tokenToBeReceived]; // Array of token addresses to borrow
    const amounts = [loanAmount];  // Corresponding loan amounts
    const abiCoder = new ethers.AbiCoder();
    const userData = abiCoder.encode(["string"], [""]); // Optional data payload

    const tokenContract = new ethers.Contract(tokenToBeReceived, ERC20ABI, provider);

    const tokenType = util.getTokenType(config, tokenToBeReceived);

    let wallet = new ethers.Wallet(priKeyPayer, provider);
    const contract = new ethers.Contract(deployedContractAddress, abi, wallet);

    const payerAddress = await wallet.getAddress();
    console.log("Payer : " + payerAddress);
    console.log('Before value of ETH :' + await provider.getBalance(payerAddress) + " Before value of " + tokenType + "(no change expected)  : " + await tokenContract.balanceOf(payerAddress));
    try {
        const tx = await contract.makeFlashLoan(
            tokens,
            amounts,
            userData,
            {
                maxFeePerGas: ethers.parseUnits("50", "gwei"),        // Maximum total gas fee per unit of gas
                maxPriorityFeePerGas: ethers.parseUnits("1", "gwei"), // Tip for miners
                gasLimit: ethers.parseUnits("2000000", "wei")
            }
        );
        await tx.wait();
        console.log("Flash loan transaction:", tx.hash);
    } catch (error) {
        console.error("Error sending Ether:", error);
    }
    console.log('After Swap value of ETH :' + await provider.getBalance(payerAddress) + " After Swap  value of " + tokenType + " (no change expected) : " + await tokenContract.balanceOf(payerAddress));

}



main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

