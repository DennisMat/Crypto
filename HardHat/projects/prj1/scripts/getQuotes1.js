async function main() {
    require('dotenv').config();
    const util = require("./utils/util.js");
    const config = require("./config.local.json");
    console.log("Loaded config... env = " + config.env);

    const provider = new ethers.JsonRpcProvider(config.providerUrl);
    const priKeyPayer = process.env.priKeyPayerTest
    const routerList = config.SWAP_PLATFORMS.Ethereum;

    await getConversionRateGeneric(config, provider, util, priKeyPayer, routerList.Uniswap_V3_Quoter, [config.tokens.WETH, config.tokens.DAI], "1");


    

}


async function getConversionRateGeneric(config, provider, util, priKeyPayer, routerAddress, path, amountIn) {

    console.log("======================================");
    const routerList = config.SWAP_PLATFORMS.Ethereum;
    const routerName = util.utilSearch.getRouterName(config, routerAddress);


    let amountOut = 0;
    let tokenInName = util.utilSearch.getTokenName(config, path[0]);
    let tokenOutName = util.utilSearch.getTokenName(config, path[1]);
    try {
        let amountInReq = amountIn;
        if (tokenInName == util.utilSearch.getTokenName(config, config.tokens.WETH)) {
            amountInReq = ethers.parseUnits(amountIn, "ether");
        }


        if (routerName == util.utilSearch.getRouterName(config, routerList.Uniswap_V3_Quoter)) {

            const quoterAbi = [
                "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external view returns (uint256)"
            ];

            let wallet = new ethers.Wallet(priKeyPayer, provider);
            const contract = new ethers.Contract(routerAddress, quoterAbi, wallet);

            const tokenIn = path[0];
            const tokenOut = path[1];
            const fee = 3000;


            //In the past quoteExactInputSingle using callStatic to avoid gas costs.
            // But in laterversion of ethers it atomatica;;y removes the cost of gas
            amountOut = await contract.quoteExactInputSingle(tokenIn, tokenOut, fee, amountInReq,
                0,//use zero for max
            );
            console.log("amountOut=" , amountOut);
        }



    } catch (error) {
        console.error("Error getting conversion rate:", error);
    }

    console.log("Conversion rate on " + routerName);

    let amountOutFormatted = amountOut;

    if (tokenInName == util.utilSearch.getTokenName(config, config.WETH)) {
        tokenInName = "ETH";
    }

    if (tokenOutName == util.utilSearch.getTokenName(config, config.WETH)) {
        amountOutFormatted = ethers.formatUnits(amountOut, 12)
        tokenOutName = "ETH";
    } else if (tokenOutName == util.utilSearch.getTokenName(config, config.DAI)) {
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



main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });