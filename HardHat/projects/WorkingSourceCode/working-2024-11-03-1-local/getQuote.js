async function main() {

    const util = require("./util.js");
    const config = require("./config.local.json");
    console.log("Loaded config... env = " + config.env);
    const fs = require('fs').promises;



    const provider = new ethers.JsonRpcProvider(config.providerUrl);
    const loanAmount = ethers.parseUnits("10", "ether");

  

   

    async function doStuff1() {
        let amountIn = ethers.parseUnits("1", "ether");

        let amountOut1 = await getConversionRateGeneric(config, provider, util, config.SWAP_PLATFORMS.Ethereum.Uniswap_V2_Router, [config.WETH, config.USDT], amountIn);
        let amountOut2 = await getConversionRateGeneric(config, provider, util, config.SWAP_PLATFORMS.Ethereum.Uniswap_V2_Router, [config.USDT, config.WETH], amountOut1);

        let logText="loss";
        if (amountIn < amountOut2) {
            logText="Profit Uniswap=" + ethers.formatUnits((amountOut2 - amountIn), "ether") + " ether";
        } else {
            logText="Loss Uniswap=" + ethers.formatUnits((amountIn - amountOut2), "ether") + " ether";
        }
        fs.appendFile('log.txt', logText +"\n", 'utf8');

    }

    async function doStuff2() {
        let amountIn = ethers.parseUnits("1", "ether");

        let amountOut1 = await getConversionRateGeneric(config, provider, util, config.SWAP_PLATFORMS.Ethereum.SushiSwap_Router, [config.WETH, config.USDT], amountIn);
        let amountOut2 = await getConversionRateGeneric(config, provider, util, config.SWAP_PLATFORMS.Ethereum.SushiSwap_Router, [config.USDT, config.WETH], amountOut1);

        let logText="loss";
        if (amountIn < amountOut2) {
            logText="Profit Sushiswap=" + ethers.formatUnits((amountOut2-amountIn), "ether") + " ether";
        } else {
            //logText="Loss Sushiswap=" + ethers.formatUnits((amountIn - amountOut2), "ether") + " ether";
        }
        //fs.appendFile('log.txt', logText +"\n", 'utf8');

    }

    for (let i = 0; i < 1; i++) {
        console.log(`Iteration: ${i}`);
        doStuff1();
        doStuff2();
        await new Promise(resolve => setTimeout(resolve, 10000));;
    }



}



async function getConversionRateGeneric(config, provider, util, routerAddress, path, amountIn) {

    const routerAbi = [
        "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
    ];
    const router = new ethers.Contract(routerAddress, routerAbi, provider);
    let amountOut = 0;
    try {
        const amounts = await router.getAmountsOut(amountIn, path);
        amountOut = amounts[1];
        console.log(`Conversion rate on ${routerAddress === config.UNISWAP_V2_ROUTER ? "Uniswap" : "SushiSwap"}:`);
        if (path[0] == config.WETH) {
            console.log(ethers.formatUnits(amountIn, "ether") + `  ETH = ${ethers.formatUnits(amountOut, 6)} USDT`);
        } else {
            console.log(amountIn, `USDC = ${ethers.formatUnits(amountOut, 12)} ETH `);
        }
        console.log("amountIn = " + amountIn +" amountOut = " + amountOut);

    } catch (error) {
        console.error("Error getting conversion rate:", error);
    }
    return amountOut;
}


async function getConversionRate(config, provider, util, routerAddress, path) {
    // ABI for `getAmountsOut` function
    const routerAbi = [
        "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
    ];


    const amountIn = ethers.parseUnits("1", "ether");
    // Connect to router contract
    const router = new ethers.Contract(routerAddress, routerAbi, provider);

    // Define the token path (WETH -> USDT)
    //const path = [config.WETH, config.USDT];

    // Call getAmountsOut to get the estimated amount of USDT
    try {
        const amounts = await router.getAmountsOut(amountIn, path);
        const amountOut = amounts[1];
        console.log(`Conversion rate on ${routerAddress === config.UNISWAP_V2_ROUTER ? "Uniswap" : "SushiSwap"}:`);
        console.log(`1 ETH = ${ethers.formatUnits(amountOut, 6)} USDT`);
    } catch (error) {
        console.error("Error getting conversion rate:", error);
    }


}

// Get rates for Uniswap and SushiSwap

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });