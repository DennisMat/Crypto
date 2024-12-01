async function getFeeData(priKeyPayer, provider) {
    const ERC20ABI = require('./ERC20.json');
    let wallet = new ethers.Wallet(priKeyPayer, provider);
       //const erc20 = new ethers.Contract(deployedContractAddress, ERC20ABI, wallet);
   
       const feeData = await provider.getFeeData();
   
       //console.log("feeData=", feeData);
       // doc: https://docs.ethers.org/v5/api/providers/provider/#Provider-getGasPrice
       // {
   //   gasPrice:1000000008n. The gasPrice to use for legacy transactions or networks which do not support EIP-1559.
   //   maxFeePerGas: 1000000016n.  Price per unit of gas. This is based on the most recent block's baseFee.
   //   maxPriorityFeePerGas:1000000000n. 
   //Same as maxFeePerGas, but additionally this accounts for tips+  uncle risk etc.
   // }

   return feeData;
}
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
    const tokenAddresses = [config.DAI, config.USDC, config.USDT, config.WETH
    ];
    const tokens = ["DAI", "USDC", "USDT", "WETH"];

    let i = 0;
    console.log("Balances in the account " + addressToCheck + " follows:");
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

async function getSpecificTokenBalance(config, utils, provider, tokenAddress, addressToCheck) {
    let formattedBalance;
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
        formattedBalance = ethers.formatUnits(balance, decimals);

        //console.log("Address " + addressToCheck + " has balance: of ", utils.utilSearch.getTokenName(config,tokenAddress) , " = ", formattedBalance);
    } catch (error) {
        //console.log(`Failed to fetch balance for token at ${tokenAddress}: ${error}`);
    }
    return formattedBalance;
}

async function getTokensInPool(config, provider, util, factoryAddress, token0, token1) {
    const factoryArtifact = require('@uniswap/v2-core/build/UniswapV2Factory.json');


    const factory = new ethers.Contract(factoryAddress, factoryArtifact.abi, provider)

    const pair = await factory.getPair(token0, token1);
    console.log('Pair pool address = ', pair, " in factory " + getRouterName(config, factoryAddress), " has the following balances: ");

    util.getSpecificTokenBalance(config, provider, token0, pair);
    util.getSpecificTokenBalance(config, provider, token1, pair);


}

async function getLiquidity(config, provider, factoryAddress, tokenA, tokenB) {
    const UNISWAP_V2_FACTORY_ABI = [
        "function getPair(address tokenA, address tokenB) external view returns (address pair)"
    ];
    const UNISWAP_V2_PAIR_ABI = [
        "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
        "function token0() external view returns (address)",
        "function token1() external view returns (address)"
    ];



    // Instantiate the Uniswap factory contract
    const factoryContract = new ethers.Contract(factoryAddress, UNISWAP_V2_FACTORY_ABI, provider);

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





module.exports = {
    checkAccountBalance, getLiquidity, getTokenBalances,
    getSpecificTokenBalance, getTokensInPool,getFeeData

}; 