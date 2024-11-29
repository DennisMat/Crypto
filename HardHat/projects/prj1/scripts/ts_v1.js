async function main() {
    const utils = require("./utils/util.js");
    const config = require("./config.local.json");
    const apikeyFile="C:/work/misc/keys.local.json";
    const configKey = require(apikeyFile);
    console.log("Loaded config... env = " + config.env);
    const fs = require('fs').promises;
    const provider = new ethers.JsonRpcProvider(config.providerUrl);
    const priKeyPayer = configKey.privateKeyPayerTest;

    //const deployedContractAddress = await utils.utilDeploy.deploy("TransactV01");
    const deployedContractAddress = "0xF2cb3cfA36Bfb95E0FD855C1b41Ab19c517FcDB9";

    const loanAmount = ethers.parseUnits("1", "ether");

    await executeArbit(config, provider, utils, priKeyPayer, deployedContractAddress,loanAmount);

}



async function executeArbit(config, provider, utils, priKeyPayer, deployedContractAddress, loanAmount) {

    const tokenToBeReceived = config.tokens.WETH; 
    

    const ERC20ABI = require('./utils/ERC20.json');
    //const { abi, bytecode } = require("../artifacts/contracts/TransactV01.sol/TransactV01.json");
    const { abi, bytecode } = require("../artifacts/contracts/TransactV01.sol/TransactV01.json");

    

    const tokens = [tokenToBeReceived]; // Array of token addresses to borrow
    const amounts = [loanAmount];  // Corresponding loan amounts
    const abiCoder = new ethers.AbiCoder();
    const userData = abiCoder.encode(["string"], [""]); // Optional data payload



    const tokenType = utils.utilSearch.getTokenName(config, tokenToBeReceived);

    let wallet = new ethers.Wallet(priKeyPayer, provider);
    const contract = new ethers.Contract(deployedContractAddress, abi, wallet);

    const payerAddress = await wallet.getAddress();
    //console.log("Payer : " + payerAddress);
   
   try {
        const tx = await contract.makeFlashLoanTestOnly(
            tokens,
            amounts,
            userData,
            {
                maxFeePerGas: ethers.parseUnits("50", "gwei"),        // Maximum total gas fee per unit of gas
                maxPriorityFeePerGas: ethers.parseUnits("1", "gwei"), // Tip for miners
                gasLimit: ethers.parseUnits("2000000", "wei"),
                value: ethers.parseUnits("1", "ether"),
            }
        );
        await tx.wait();
        console.log("Flash loan transaction:", tx.hash);
    } catch (error) {
        console.error("Error sending Ether:", error);
    }
    //console.log('After Swap value of ETH :' + await provider.getBalance(payerAddress) + " After Swap  value of " + tokenType + " (no change expected) : " + await tokenContract.balanceOf(payerAddress));

  

}



main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

