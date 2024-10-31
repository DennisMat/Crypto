async function main() {
    const { expect, assert } = require("chai");

    const util = require("./util.js");
    const config = require("./config.local.json");
    console.log("Loaded config... env = " + config.env);


    //const deployedContractAddress = await deploy("UniswapExample");
    const deployedContractAddress = "0xAB8Eb9F37bD460dF99b11767aa843a8F27FB7A6e";

    const provider = new ethers.JsonRpcProvider(config.providerUrl);
    const tokenToBeReceived = config.DAI;

    await swapETHForToken(config, provider, config.priKeyPayer, deployedContractAddress, tokenToBeReceived);
    await swapETHForToken(config, provider, config.priKeyPayer, deployedContractAddress, config.USDC);
    await swapETHForToken(config, provider, config.priKeyPayer, deployedContractAddress, config.USDT);

    await util.getTokenBalances(config, provider,config.payerAccount );


}

async function deploy(SolidityContract) {
    const contractFactory =
        await ethers.getContractFactory(SolidityContract)
            .then(contract => contract.deploy({
                maxFeePerGas: ethers.parseUnits("50", "gwei"),        // Maximum total gas fee per unit of gas
                maxPriorityFeePerGas: ethers.parseUnits("1", "gwei"), // Tip for miners
                gasLimit: ethers.parseUnits("2000000", "wei")
            }));

    await contractFactory.waitForDeployment();
    const deployedAddress = await contractFactory.getAddress();
    console.log('uniswapTradeExample deployed to:', deployedAddress);
    return deployedAddress;
}


async function swapETHForToken(config, provider, priKeyPayer, deployedContractAddress, tokenToBeReceived) {
    const ERC20ABI = require('./ERC20.json');
    const contractABIGetTokens = [{
        "inputs": [{
            "internalType": "uint256",
            "name": "amountOutMin",
            "type": "uint256"
        }, {
            "internalType": "address",
            "name": "token",
            "type": "address"
        }],
        "name": "swapExactETHForTokens",
        "outputs": [],
        "stateMutability": "payable", // Notice it's a payable function
        "type": "function"
    }
    ];

    

    const tokenContract = new ethers.Contract(tokenToBeReceived, ERC20ABI, provider);

    const tokenType=getTokenType(config, tokenToBeReceived);

    let wallet = new ethers.Wallet(config.priKeyPayer, provider);
    const contract = new ethers.Contract(deployedContractAddress, contractABIGetTokens, wallet);

    const payerAddress = await wallet.getAddress();
    console.log("Payer : " + payerAddress);
    console.log('Before value of ETH :' + await provider.getBalance(payerAddress) + " Before value of " + tokenType +" : " + await tokenContract.balanceOf(payerAddress));
    try {
        const tx = await contract.swapExactETHForTokens(
            0,
            tokenToBeReceived,
            { value: ethers.parseUnits("1", "ether") }
        );
    } catch (error) {
        console.error("Error sending Ether:", error);
    }
    console.log('After Swap value of ETH :' + await provider.getBalance(payerAddress) + " After Swap  value of " + tokenType +" : " + await tokenContract.balanceOf(payerAddress));
   
}

function getTokenType(config, address){
    let tokenType="WETH";

    if(config.DAI==address){
        tokenType="DAI";
    }else if(config.USDC==address){
        tokenType="USDT";
    }else if(config.USDT==address){
        tokenType="USDT";
    }

    return tokenType;
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

