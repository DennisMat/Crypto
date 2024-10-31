async function main() {
    const { expect, assert } = require("chai");

    const util = require("./util.js");
    const config = require("./config.local.json");
    console.log("Loaded config... env = " + config.env);


    //const deployedContractAddress = await util.deploy("SushiSwapExample");
    const deployedContractAddress = "0x2f6f107D4Afd43c451B74DA41A6DDA53D2Bf24B1";

    const provider = new ethers.JsonRpcProvider(config.providerUrl);

    await swapETHForToken(config, util, provider, config.priKeyPayer, deployedContractAddress, config.USDT);



}



async function swapETHForToken(config, util, provider, priKeyPayer, deployedContractAddress, tokenToBeReceived) {
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

    const tokenType=util.getTokenType(config, tokenToBeReceived);

    let wallet = new ethers.Wallet(priKeyPayer, provider);
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



main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

