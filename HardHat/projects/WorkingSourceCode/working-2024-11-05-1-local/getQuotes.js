async function main() {
    require('dotenv').config();
    const util = require("../../prj1/scripts/util.js");
    const config = require("../../prj1/scripts/config.local.json");
    console.log("Loaded config... env = " + config.env);

    const fs = require('fs').promises;


    console.log("the block number has to be blockNumber: 21013574 in hardhat.config.js while forking else this scrip will not work");
    const provider = new ethers.JsonRpcProvider(config.providerUrl);
    const priKeyPayer = process.env.priKeyPayerTest


    for (let i = 0; i < 1; i++) {
        console.log(`Iteration: ${i}`);
        doStuff3();

        await new Promise(resolve => setTimeout(resolve, 10000));;
    }


    async function doStuff3() {

        const routerList = config.SWAP_PLATFORMS.Ethereum;

        let amountOut1 = await getConversionRateGeneric(config, provider, util, priKeyPayer,routerList.Uniswap_V2_Router, [config.WETH, config.USDT], "1");
        let amountOut2 = await getConversionRateGeneric(config, provider, util, priKeyPayer,routerList.Uniswap_V2_Router, [config.USDT, config.WETH], "1000");
        let amountOut3 = await getConversionRateGeneric(config, provider, util, priKeyPayer,routerList.Uniswap_V2_Router, [config.WETH, config.DAI], "1");
        let amountOut4 = await getConversionRateGeneric(config, provider, util, priKeyPayer, routerList.Uniswap_V3_Quoter, [config.WETH, config.DAI], "1");

        // let logText="loss";
        // if (amountIn < amountOut2) {
        //     logText="Profit Uniswap=" + ethers.formatUnits((amountOut2 - amountIn), "ether") + " ether";
        // } else {
        //     logText="Loss Uniswap=" + ethers.formatUnits((amountIn - amountOut2), "ether") + " ether";
        // }
        // fs.appendFile('log.txt', logText +"\n", 'utf8');

    }

}


async function getConversionRateGeneric(config, provider, util, priKeyPayer,routerAddress, path, amountIn) {

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
            const quoterAddress = routerList.Uniswap_V3_Quoter;
            const quoterAbi = [
                "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external view returns (uint256)"
            ];

            let wallet = new ethers.Wallet(priKeyPayer, provider);
            const contract = new ethers.Contract(quoterAddress, quoterAbi, wallet);

            tokenIn = path[0];
            tokenOut = path[1];
            const fee = 3000;


            //In the past quoteExactInputSingle using callStatic to avoid gas costs.
            // But in laterversion of ethers it atomatica;;y removes the cost of gas
            amountOut = await contract.quoteExactInputSingle(tokenIn, tokenOut, fee, amountInReq,
                0,//use zero for max
            );
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



// Get rates for Uniswap and SushiSwap

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });