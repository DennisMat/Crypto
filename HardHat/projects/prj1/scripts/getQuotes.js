async function main() {
    require('dotenv').config();
    const util = require("../../prj1/scripts/utils/util.js");
    const config = require("../../prj1/scripts/config.local.json");
    console.log("Loaded config... env = " + config.env);

    const fs = require('fs').promises;


    console.log("the block number has to be blockNumber: 21013574  ( for uniswap and sushiswap ) in hardhat.config.js while forking else this scrip will not work");
    const provider = new ethers.JsonRpcProvider(config.providerUrl);
    const priKeyPayer = process.env.priKeyPayerTest


    for (let i = 0; i < 1; i++) {
        console.log(`Iteration: ${i}`);
        doStuff3();

        await new Promise(resolve => setTimeout(resolve, 1000));
        
    }


    async function doStuff3() {

        const routerList = config.SWAP_PLATFORMS.Ethereum;

         //await util.utilQuotes.getQuotes(config, provider, util, priKeyPayer,routerList.Uniswap_V2_Router, [config.WETH, config.USDT], "1");
        // await getConversionRateGeneric(config, provider, util, priKeyPayer,routerList.Uniswap_V2_Router, [config.USDT, config.WETH], "1000");
        // await getConversionRateGeneric(config, provider, util, priKeyPayer,routerList.Uniswap_V2_Router, [config.WETH, config.DAI], "1");
        // await getConversionRateGeneric(config, provider, util, priKeyPayer, routerList.Uniswap_V3_Quoter, [config.WETH, config.DAI], "1");

        // await getConversionRateGeneric(config, provider, util, priKeyPayer, routerList.Balancer_V2_Vault, [config.WETH, config.DAI], "1");
        //await getTokensInBalancerPool(config, provider, util, priKeyPayer, "0x0075C4264d6b34c513dd53D22dBE06A036a57D3E");
        //await util.getTokensInPool(config, provider, util,routerList.UNI_FACTORY,config.USDC, config.WETH);

        //const poolId= await getPoolId(config.USDC, config.WETH);

       // await getTokensInBalancerPool(config, provider, util, priKeyPayer, poolId);


    }

}


async function getConversionRateGeneric(config, provider, util, priKeyPayer, routerAddress, path, amountIn) {

    console.log("======================================");
    const routerList = config.SWAP_PLATFORMS.Ethereum;
    const routerName = util.getRouterName(config, routerAddress);


    let amountOut = 0;
    let tokenInName = util.getTokenName(config, path[0]);
    let tokenOutName = util.getTokenName(config, path[1]);
    try {
        let amountInReq = amountIn;
        if (tokenInName == util.getTokenName(config, config.WETH)) {
            amountInReq = ethers.parseUnits(amountIn, "ether");
        }
        if (routerName == util.getRouterName(config, routerList.Uniswap_V2_Router)) {
            const routerAbi = [
                "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
            ];
            const contract = new ethers.Contract(routerAddress, routerAbi, provider);
            const amounts = await contract.getAmountsOut(amountInReq, path);
            amountOut = amounts[1];
        }


        if (routerName == util.getRouterName(config, routerList.Uniswap_V3_Quoter)) {

            const quoterAbi = [
                "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external view returns (uint256)"
            ];

            let wallet = new ethers.Wallet(priKeyPayer, provider);
            const contract = new ethers.Contract(routerAddress, quoterAbi, wallet);

            tokenIn = path[0];
            tokenOut = path[1];
            const fee = 3000;


            //In the past quoteExactInputSingle using callStatic to avoid gas costs.
            // But in laterversion of ethers it atomatica;;y removes the cost of gas
            amountOut = await contract.quoteExactInputSingle(tokenIn, tokenOut, fee, amountInReq,
                0,//use zero for max
            );
        }

        /*
        */
        if (routerName == util.getRouterName(config, routerList.Balancer_V2_Vault)) {

            const vaultAbi = [
                "function queryBatchSwap(int256 kind,tuple(address tokenIn, uint256 amountIn)[] swaps, address[] assets, uint256[] userData) external view returns (int256[] memory amountsOut)"
            ];

            let wallet = new ethers.Wallet(priKeyPayer, provider);
            const contract = new ethers.Contract(routerAddress, vaultAbi, wallet);
            tokenIn = path[0];
            tokenOut = path[1];

            const swaps = [{
                tokenIn: tokenIn,
                amountIn: amountInReq.toString()
            }];

            const amounts = await contract.queryBatchSwap(
                0, // Swap kind (0 for swap exact in, 1 for swap exact out)
                swaps, path, []);
            amountOut = amounts[1];

        }

    } catch (error) {
        console.error("Error getting conversion rate:", error);
    }

    console.log("Conversion rate on " + routerName);

    let amountOutFormatted = amountOut;

    if (tokenInName == util.getTokenName(config, config.WETH)) {
        tokenInName = "ETH";
    }

    if (tokenOutName == util.getTokenName(config, config.WETH)) {
        amountOutFormatted = ethers.formatUnits(amountOut, 12)
        tokenOutName = "ETH";
    } else if (tokenOutName == util.getTokenName(config, config.DAI)) {
        amountOutFormatted = ethers.formatUnits(amountOut, 18)
    } else {
        amountOutFormatted = ethers.formatUnits(amountOut, 6)
    }
    console.log(amountIn + " " + tokenInName + " = " + amountOutFormatted + " " + tokenOutName);



    console.log("======================================");

    return amountOut;
}


async function getTokensInBalancerPool(config, provider, util, priKeyPayer, poolId) {
    const vaultAddress = "0xBA12222222228d8Ba445958a75a0704d566BF2C8"; // Balancer Vault on Ethereum

    const vaultAbi = [
        "function getPoolTokens(address poolId) external view returns (address[] memory tokens, uint[] memory balances, uint8[] memory tokenDecimals)"
    ];

    const vaultContract = new ethers.Contract(vaultAddress, vaultAbi, provider);

    const [tokens, ,] = await vaultContract.getPoolTokens(poolId);
    console.log("Tokens in the pool: ", tokens);
}



async function getPoolId(tokenIn, tokenOut) {
    const SOR = require('@balancer-labs/sor');
  const poolsUrl = 'https://api.balancer.fi/v1/pools'; // or use a local pool data source
  console.log(SOR);
  //const poolData = await SOR.fetchPools(poolsUrl);
  const filteredPools = poolData.filter((pool) => {
    return pool.specialization === 'TWO_TOKEN' && pool.tokens.includes(tokenIn) && pool.tokens.includes(tokenOut);
  });
  console.log("pool id ", filteredPools[0].id);
  return filteredPools[0].id; // or iterate over the filtered pools to find the desired one
}





main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });