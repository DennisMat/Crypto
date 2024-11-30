async function main() {
    const utils = require("./utils/util.js");
    const config = require("./config.local.json");
    const apikeyFile = "C:/work/misc/keys.local.json";
    const configKey = require(apikeyFile);
    console.log("Loaded config... env = " + config.env);
    const fs = require('fs').promises;
    const provider = new ethers.JsonRpcProvider(config.providerUrl);
    const priKeyPayer = configKey.privateKeyPayerTest;

    const deployedContractAddress = await utils.utilDeploy.deploy("TransactV01");
    //const deployedContractAddress = "0xd544d7A5EF50c510f3E90863828EAba7E392907A";

    const loanAmount = ethers.parseUnits("1", "ether");
    const myBank = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
    //await executeArbit(config, provider, utils, priKeyPayer, deployedContractAddress,loanAmount);
    //await sendWETH(config, provider, utils, priKeyPayer, deployedContractAddress,ethers.parseUnits("1", "ether"), myBank);
    // await sendWETH(config, provider, utils, priKeyPayer, deployedContractAddress, 5789n, myBank);
    //(UNISWAP_V2_ROUTER)10000====>(SushiSwap_Router)9955====>(UNISWAP_V2_ROUTER)10039 Profit = 39token combination = USDT USDC


    const routerList = config.SWAP_PLATFORMS.Ethereum;

    const routers = [routerList.Uniswap_V2_Router, routerList.SushiSwap_Router];
    const tokens = [config.tokens.USDT, config.tokens.USDC];
   // const tokens = [config.tokens.WETH,config.tokens.WETH];

    const flashLoanAmount = 34560000000n;

    await doTrans(config, provider, utils, priKeyPayer, deployedContractAddress, flashLoanAmount, routers, tokens, myBank);

}

async function doTrans(config, provider, utils, priKeyPayer, deployedContractAddress, flashLoanAmount, routers, tokens, myBank) {
    await utils.utilBalances.getSpecificTokenBalance(config, utils, provider, config.tokens.WETH, myBank);

    const ERC20ABI = require('./utils/ERC20.json');
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
            myBank, [flashLoanAmount], userData,
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
    await utils.utilBalances.getSpecificTokenBalance(config, utils, provider, config.tokens.WETH, myBank);
    const ERC20ABI = require('./utils/ERC20.json');
    const { abi, bytecode } = require("../artifacts/contracts/TransactV01.sol/TransactV01.json");
    // const abi = [
    //     "function convertAndSendWETH(address recipient) public payable",
    //   ];

    let wallet = new ethers.Wallet(priKeyPayer, provider);
    const contract = new ethers.Contract(deployedContractAddress, abi, wallet);

    const payerAddress = await wallet.getAddress();

    try {
        const tx = await contract.convertAndSendWETH(myBank,
            {
                maxFeePerGas: ethers.parseUnits("50", "gwei"),        // Maximum total gas fee per unit of gas
                maxPriorityFeePerGas: ethers.parseUnits("1", "gwei"), // Tip for miners
                gasLimit: ethers.parseUnits("2000000", "wei"),
                value: amount
            }
        );
        await tx.wait();
        console.log("Send WETH transaction:", tx.hash);
    } catch (error) {
        console.error("Error sending Ether:", error);
    }

    await utils.utilBalances.getSpecificTokenBalance(config, utils, provider, config.tokens.WETH, myBank);


}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

