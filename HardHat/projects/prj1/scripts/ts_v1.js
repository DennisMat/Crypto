async function main() {
    const ERC20ABI = require('./utils/ERC20.json');
    const utils = require("./utils/util.js");
    const config = require("./config.local.json");
    const apikeyFile = "C:/work/misc/keys.local.json";
    const configKey = require(apikeyFile);
    console.log("Loaded config.env = " + config.env);
    const fs = require('fs').promises;
    const provider = new ethers.JsonRpcProvider(config.providerUrl);



    //const priKeyPayer = configKey.localAddress1PrivateKey;
    const priKeyPayer = configKey.privateKeyPayerTest;
    
    const myBank = config.localAddress2;

    const deployedContractAddress = await utils.utilDeploy.deploy("TransactV01");
    //const deployedContractAddress = "0x366FDba679A8ece0567C1aFFC8C543f6FE9964d5";




    //await executeArbit(config, provider, utils, priKeyPayer, deployedContractAddress,loanAmount);
    await sendWETH(config, provider, utils, priKeyPayer, deployedContractAddress,ethers.parseUnits("1", "ether"), myBank);
    //await sendWETH(config, provider, utils, priKeyPayer, deployedContractAddress, 500n, myBank);


    // const loanAmount = ethers.parseUnits("1", "ether");
    // const routerList = config.SWAP_PLATFORMS.Ethereum;

    // const routers = [routerList.Uniswap_V2_Router, routerList.Uniswap_V3_Router];
    // //const routers = [routerList.Uniswap_V2_Router];
    // //const tokens = [config.tokens.WETH,config.tokens.USDT, config.tokens.USDC,config.tokens.WETH];
    // const tokens = [config.tokens.WETH, config.tokens.USDC, config.tokens.WETH];

    // const flashLoanAmount = 34560000000n;
    // const maxPoolFee = 3000n;

    //await doTrans(config, provider, utils, priKeyPayer, deployedContractAddress, flashLoanAmount, maxPoolFee, routers, tokens, myBank);

}

async function doTrans(config, provider, utils, priKeyPayer, deployedContractAddress, flashLoanAmount, maxPoolFee, routers, tokens, myBank) {
    console.log("before balance = " + await utils.utilBalances.getSpecificTokenBalance(config, utils, provider, config.tokens.WETH, myBank));
    
    const { abi, bytecode } = require("../artifacts/contracts/TransactV01.sol/TransactV01.json");

    const abiCoder = new ethers.AbiCoder();
    const userData = abiCoder.encode(["string"], [""]); // Optional data payload

    let wallet = new ethers.Wallet(priKeyPayer, provider);
    const contract = new ethers.Contract(deployedContractAddress, abi, wallet);

    const payerAddress = await wallet.getAddress();
    //console.log("Payer : " + payerAddress);

    try {
        const tx = await contract.doTrans(
            routers, tokens,
            myBank, [flashLoanAmount], maxPoolFee, userData,
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
    console.log("after balance = " + await utils.utilBalances.getSpecificTokenBalance(config, utils, provider, config.tokens.WETH, myBank));

}


async function executeArbit(config, provider, utils, priKeyPayer, deployedContractAddress, loanAmount, myBank) {

    const tokenToBeReceived = config.tokens.WETH;

    const ERC20ABI = require('./utils/ERC20.json');
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
    await utils.utilBalances.getSpecificTokenBalance(config, utils, provider, config.tokens.WETH, myBank);

}



async function sendWETH(config, provider, utils, priKeyPayer, deployedContractAddress, amount, myBank) {




    console.log("WETH before balance in  " + myBank + " " + await utils.utilBalances.getSpecificTokenBalance(config, utils, provider, config.tokens.WETH, myBank));
    const ERC20ABI = require('./utils/ERC20.json');
    const { abi, bytecode } = require("../artifacts/contracts/TransactV01.sol/TransactV01.json");

    let wallet = new ethers.Wallet(priKeyPayer, provider);
    const contract = new ethers.Contract(deployedContractAddress, abi, wallet);

    const feeData=await utils.utilBalances.getFeeData(priKeyPayer, provider);

    const feeBuffer=100n;
    const gasLimit=30000000n; //this appers to be a hard limit set by the networkInterfaces.

    try {
        const tx = await contract.convertAndSendWETH(myBank,
            {
                maxFeePerGas: feeData.maxFeePerGas +feeBuffer,  // this the base fee which is typically 1000000000n
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas +feeBuffer, // Tip for miners
                gasLimit: gasLimit,// this is the upper limit
                value: amount
            }
        );
        await tx.wait();
        console.log("Send WETH transaction:", tx.hash);
    } catch (error) {
        console.error("Error sending Ether:", error);
    }

    console.log("WETH after balance in  " + myBank + " " + await utils.utilBalances.getSpecificTokenBalance(config, utils, provider, config.tokens.WETH, myBank));


}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

