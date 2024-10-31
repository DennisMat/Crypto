async function checkAccountBalance(address) {
    const accounts = (await ethers.getSigners()).map(signer => signer.address);

    // for (var i in accounts) {
    const bal1 = "account: " + address + " balance : " + await ethers.provider.getBalance(address);
    console.log(bal1);
    // }
}


async function getTokenBalances(config, provider, addressToCheck) {

    // ERC-20 ABI for the balanceOf function
    const erc20Abi = [
        'function balanceOf(address account) external view returns (uint256)',
        'function decimals() external view returns (uint8)'
    ];

    // List of ERC-20 token addresses to check (add more if needed)
    const tokenAddresses = [        config.DAI,        config.USDC,        config.USDT,        config.WETH
    ];
    const tokens = [        "DAI",        "USDC",        "USDT",        "WETH"    ];

    let i = 0;
 console.log("Balances in the account " + addressToCheck +" follows:");
    for (const tokenAddress of tokenAddresses) {
        // Create a new contract instance for each token
        const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);

        try {
            // Get token balance and decimals
            const balance = await tokenContract.balanceOf(addressToCheck);
            const decimals = await tokenContract.decimals();

            // Format balance based on token decimals
            const formattedBalance = ethers.formatUnits(balance, decimals);
            //"Token: " + tokens[i++] + 
            //console.log(`Token Address: ${tokenAddress}, Balance: ${formattedBalance}`); // IMPORTANT!= works notice the quotes
            //console.log("Token: " + tokens[i++] + ` Token Address: ${tokenAddress}, Balance: ${formattedBalance}`);
            console.log("Token: " + tokens[i++] + " Token Pool Address: " + tokenAddress + " Balance: " + formattedBalance);
        } catch (error) {
            //console.log(`Failed to fetch balance for token at ${tokenAddress}: ${error}`);
        }
    }


}

async function getSpecificTokenBalance(config, provider, tokenAddress, addressToCheck) {

    // ERC-20 ABI for the balanceOf function
    const erc20Abi = [
        'function balanceOf(address account) external view returns (uint256)',
        'function decimals() external view returns (uint8)'
    ];
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    try {
        // Get token balance and decimals
        const balance = await tokenContract.balanceOf(addressToCheck);
        const decimals = await tokenContract.decimals();

        // Format balance based on token decimals
        const formattedBalance = ethers.formatUnits(balance, decimals);

        console.log(" Token Pool Address: " + tokenAddress + ". Address " + addressToCheck +" has Balance: " + formattedBalance);
    } catch (error) {
        //console.log(`Failed to fetch balance for token at ${tokenAddress}: ${error}`);
    }

}

async function getLiquidity(config, provider, tokenA, tokenB) {
    const UNISWAP_V2_FACTORY_ABI = [
        "function getPair(address tokenA, address tokenB) external view returns (address pair)"
    ];
    const UNISWAP_V2_PAIR_ABI = [
        "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
        "function token0() external view returns (address)",
        "function token1() external view returns (address)"
    ];



    // Instantiate the Uniswap factory contract
    const factoryContract = new ethers.Contract(config.UNISWAP_V2_FACTORY_ADDRESS, UNISWAP_V2_FACTORY_ABI, provider);

    // Get the pair address for the two tokens
    const pairPoolAddress = await factoryContract.getPair(tokenA, tokenB);

    // Fallback AddressZero (if needed)
    const addressZero = '0x0000000000000000000000000000000000000000';

    if (pairPoolAddress === addressZero) {
        console.log("No liquidity pool found for this pair.");
        return;
    }
    // Instantiate the pair contract
    const pairContract = new ethers.Contract(pairPoolAddress, UNISWAP_V2_PAIR_ABI, provider);

    // Fetch reserves from the pair contract
    const [reserve0, reserve1] = await pairContract.getReserves();

    // Get the addresses of token0 and token1
    const token0 = await pairContract.token0();
    const token1 = await pairContract.token1();

    // Print out reserves based on token order
    if (tokenA.toLowerCase() === token0.toLowerCase()) {
        console.log(`Reserve of WETH: ${reserve0}`);
        console.log(`Reserve of DAI: ${reserve1}`);
    } else {
        console.log(`Reserve of WETH: ${reserve1}`);
        console.log(`Reserve of DAI: ${reserve0}`);
    }

    return {
        reserveA: tokenA.toLowerCase() === token0.toLowerCase() ? reserve0 : reserve1,
        reserveB: tokenB.toLowerCase() === token1.toLowerCase() ? reserve1 : reserve0,
    };
}

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
    checkAccountBalance, getLiquidity, sendEtherToGetTokenOnlyForDemo,
    sendEtherToGetTokenLessGas,
    recieveEtherUsingTokens, reciveEtherForTokensLessGas, getTokenBalances, getSpecificTokenBalance

}; 