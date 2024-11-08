
async function sendEtherToGetTokenOnlyForDemo(config, provider, deployedContractAddress) {

    console.log("Before swap  ETH for tokens. More gas version ...");

    let signer = new ethers.Wallet(config.priKeyPayer, provider);

    const contractABIGetTokens = [
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "UNISWAP_V2_ROUTER",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "tokenSourceAddress",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenAmountOutMin",
                    "type": "uint256"
                }],
            "name": "buyTokensWithETHMoreGas",
            "outputs": [],
            "stateMutability": "payable",  // Notice it's a payable function
            "type": "function"
        }
    ];

    const contract = new ethers.Contract(deployedContractAddress, contractABIGetTokens, signer);

    //const amountOutMin = ethers.parseUnits("1.0", 18);// 1 ether
    //const amountToBeSwapped=ethers.parseEther("20.0");// 20 ether

    const amountOutMin = ethers.parseUnits("1.0", "wei");// 1 wei
    const amountToBeSwapped = ethers.parseUnits("3.0", "wei");//1 wei


    try {
        const tx = await contract.buyTokensWithETHMoreGas(config.UNISWAP_V2_ROUTER, config.uniswapWETHTokenSourceAddress, amountOutMin, {
            gasPrice: ethers.parseUnits('100000', 'gwei'),  // Specify the gas price
            gasLimit: 215720,  // Gas limit for a standard Ether transfer
            value: amountToBeSwapped
        });
        await tx.wait();  // Wait for the transaction to be confirmed
        const receipt = await provider.getTransactionReceipt(tx.hash);
        const gasUsed = receipt.gasUsed;

        console.log("After swap  Tokens => ETH. More gas version . Gas used =" + gasUsed);

    } catch (error) {
        console.error("Error sending Ether:", error);
    }

}

async function reciveEtherForTokensLessGas(config, provider, deployedContractAddress) {
    console.log("Before swap  ETH for tokens. Less gas version ...");
    let wallet = new ethers.Wallet(config.priKeyPayer, provider);
    const contractABIGetTokens = [
        {
            "inputs": [],
            "name": "recieveETHForTokensLessGas",
            "outputs": [],
            "stateMutability": "nonpayable",  // Notice it's a payable function
            "type": "function"
        }
    ];
    const contract = new ethers.Contract(deployedContractAddress, contractABIGetTokens, wallet);
    const amountToBeSwapped = ethers.parseEther("2.0");// 200 ether   
    //const amountToBeSwapped = ethers.parseUnits("3.0", "wei");//1 wei
    //const amountToBeSwapped = ethers.parseUnits("3.0", "wei");
    try {
        const tx = await contract.recieveETHForTokensLessGas({
            gasPrice: ethers.parseUnits('10000', 'gwei'),  // Specify the gas price
            gasLimit: 2100000,  // Gas limit for a standard Ether transfer
            value: amountToBeSwapped
        });
        await tx.wait();  // Wait for the transaction to be confirmed
        console.log("After swap  ETH for tokens. Less gas version ...");
    } catch (error) {
        console.error("Error sending Ether:", error);
    }
}

async function recieveEtherUsingTokens(config, provider, deployedContractAddress) {
    let wallet = new ethers.Wallet(config.priKeyPayer, provider);

    const contractABIGetETHForTokens = [
        "recieveETHForTokensFullVersion(address UNISWAP_V2_ROUTER, address tokenSourceAddress,  uint tokenAmountIn, uint ethAmountOutMin  ) public"
    ]

    const contractABIGetETH = [
        {
            "inputs": [{
                "internalType": "address",
                "name": "UNISWAP_V2_ROUTER",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "tokenSourceAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokenAmountIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "ethAmountOutMin",
                "type": "uint256"
            }],
            "name": "recieveETHForTokensFullVersion",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];

    const contract = new ethers.Contract(deployedContractAddress, contractABIGetETH, wallet);

    const tokenAmountIn = ethers.parseUnits("2.0", "ether");
    const ethAmountOutMin = ethers.parseUnits("100", "wei");

    const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    let tokenTypeTo = config.uniswapWETHTokenSourceAddress;
    //tokenTypeTo=DAI;


    // Step 4: Call the contract function and send Ether
    try {


        const tx = await contract.recieveETHForTokensFullVersion(config.UNISWAP_V2_ROUTER, tokenTypeTo, tokenAmountIn, ethAmountOutMin, {
            gasPrice: ethers.parseUnits('10000', 'gwei'),  // Specify the gas price
            gasLimit: 21000000,  // Gas limit for a standard Ether transfer
            // value: ethers.parseEther("20.0")
        });

        await tx.wait();  // Wait for the transaction to be confirmed


        console.log("After swap  Tokens => ETH. More gas version ...");


    } catch (error) {
        console.error("Error sending Ether:", error);
    }

}


async function sendEtherToGetTokenLessGas(config, provider, deployedContractAddress) {
    console.log("Before swap  ETH for tokens. Less gas version ...");
    let wallet = new ethers.Wallet(config.priKeyPayer, provider);
    const contractABIGetTokens = [
        {
            "inputs": [],
            "name": "buyTokensWithETHLessGas",
            "outputs": [],
            "stateMutability": "payable",  // Notice it's a payable function
            "type": "function"
        }
    ];
    const contract = new ethers.Contract(deployedContractAddress, contractABIGetTokens, wallet);
    const amountToBeSwapped = ethers.parseEther("200.0");// 200 ether   
    //const amountToBeSwapped = ethers.parseUnits("3.0", "wei");//1 wei
    try {
        const tx = await contract.buyTokensWithETHLessGas({
            gasPrice: ethers.parseUnits('10000', 'gwei'),  // Specify the gas price
            gasLimit: 2100000,  // Gas limit for a standard Ether transfer
            value: amountToBeSwapped
        });
        await tx.wait();  // Wait for the transaction to be confirmed
        console.log("After swap  ETH for tokens. Less gas version ...");
    } catch (error) {
        console.error("Error sending Ether:", error);
    }
}

module.exports = {
 sendEtherToGetTokenOnlyForDemo,
    sendEtherToGetTokenLessGas,
    recieveEtherUsingTokens, reciveEtherForTokensLessGas

}; 