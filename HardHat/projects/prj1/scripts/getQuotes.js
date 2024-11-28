async function main() {
    const util = require("./utils/util.js");
    const config = require("./config.local.json");
    const apikeyFile="C:/work/misc/keys.local.json";
    const configKey = require(apikeyFile);
    console.log("Loaded config... env = " + config.env);

    const fs = require('fs').promises;


    const provider = new ethers.JsonRpcProvider(config.providerUrl);
    const priKeyPayer = configKey.privateKeyPayerTest;


    const routerList = config.SWAP_PLATFORMS.Ethereum;

 
   
    await util.utilQuotes.getQuotes(config, provider, util, priKeyPayer,routerList.Uniswap_V3_Quoter, config.tokens.BNB, config.tokens.WETH,1000000n);//works
    //await gq();
   //await ab1(config);
   //console.log("Fetching Balancer pools...");

    //const poolId= await getPoolId(config.USDC, config.WETH);

    //await getTokensInBalancerPool(config, provider, util, priKeyPayer, poolId);

    //console.log("amountOut=",amountOut);

}




// seems to be partially working. Do not delete
async function getBlanacerQuote(config) {
    console.log("Fetching Balancer pools...");
    const { JsonRpcProvider } = require('@ethersproject/providers');
    const { BalancerSDK, Network, SOR, SwapTypes } = require('@balancer-labs/sdk');

    const INFURA_API_KEY = "1e560f313576436386b8dd0651847b90"; // Replace with your Infura API key
    const RPC_URL = `https://mainnet.infura.io/v3/${INFURA_API_KEY}`;

    const provider = new JsonRpcProvider(RPC_URL);

    const tokenIn = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eb48"; // USDC
    const tokenOut = "0xC02aaa39b223FE8D0A0E5C4F27eAD9083C756Cc2"; // WETH
    const swapAmount = "1000000"; // 1 USDC (smallest unit, 6 decimals for USDC)
    const swapType = SwapTypes.SwapExactIn; // SwapExactIn (input amount fixed)

    const balancerConfig = {
        network: Network.MAINNET, // Ethereum mainnet
        rpcUrl: RPC_URL ,
    };
     const balancer = new BalancerSDK(balancerConfig);
     const sor = balancer.sor;
     
     console.log("Fetching Balancer pools...");
        //await sor.fetchPools();
        await fetchPoolsWithCaching(sor);
        const swapInfo = await sor.getSwaps(tokenIn, tokenOut, swapType, swapAmount);

        if (swapInfo.returnAmount.isZero()) {
            console.log("No valid swaps found.");
        } else {
            console.log("Optimal trade route found:");
            console.log("Return Amount:", swapInfo.returnAmount.toString()); // WETH in smallest unit
            console.log("Swaps:", swapInfo.swaps);
            console.log("Token Addresses:", swapInfo.tokenAddresses);
        }


}

// seems to be partially working. Do not delete
async function getBlanacerQuote1(config) {
    const { BalancerSDK, Network, SOR, SwapTypes } = require('@balancer-labs/sdk');


    
    const INFURA_API_KEY = "1e560f313576436386b8dd0651847b90"; // Replace with your Infura API key
    const RPC_URL = `https://mainnet.infura.io/v3/${INFURA_API_KEY}`;
    const balancerConfig = {
        network: Network.MAINNET, // Ethereum mainnet
        rpcUrl: RPC_URL ,
    };
    const balancer = new BalancerSDK(balancerConfig);
    const poolId =
  '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014';
const pool = await balancer.pools.find(poolId);
if (!pool) throw new BalancerError(BalancerErrorCode.POOL_DOESNT_EXIST);
const spotPrice = await pool.calcSpotPrice(
    '0xba100000625a3754423978a60c9317c58a424e3D', // BAL
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // WETH
  );

  console.log("spotPrice=" + spotPrice);

  return spotPrice;

}

var cachedPoolsData = null; // Declare a variable for caching

async function fetchPoolsWithCaching(sor) {
    if (!cachedPoolsData) {
        console.log("Fetching pools...");
        await sor.fetchPools(); // Fetch pools only if not already cached
        cachedPoolsData = sor.pools; // Cache the pools
    } else {
        console.log("Using cached pools data.");
        sor.setPools(cachedPoolsData); // Use cached data
    }
    let a=3;
}




main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });