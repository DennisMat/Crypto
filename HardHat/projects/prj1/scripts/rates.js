async function main() {


    const util = require("./util.js");
    const config = require("./config.prod.json");
    console.log("Loaded config... env = " + config.env);



    const provider = new ethers.JsonRpcProvider(config.providerUrl);
    const loanAmount = ethers.parseUnits("10", "ether");

    // Router addresses
    const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const SUSHISWAP_ROUTER_ADDRESS = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";

    // let path = [config.WETH, config.USDT];
    // await getConversionRate(config, provider, util, UNISWAP_ROUTER_ADDRESS,path);
    // await getConversionRate(config, provider, util, SUSHISWAP_ROUTER_ADDRESS,path);

    // path = [config.USDT, config.WETH];
    // await getConversionRate(config, provider, util, UNISWAP_ROUTER_ADDRESS,path);
    // await getConversionRate(config, provider, util, SUSHISWAP_ROUTER_ADDRESS,path);


    async function doStuff() {
        let amountIn = ethers.parseUnits("1", "ether");

        let amountOut1 = await getConversionRateGeneric(config, provider, util, UNISWAP_ROUTER_ADDRESS, [config.WETH, config.USDT], amountIn);
        let amountOut2 = await getConversionRateGeneric(config, provider, util, SUSHISWAP_ROUTER_ADDRESS, [config.USDT, config.WETH], amountOut1);

        if (amountIn < amountOut2) {
            console.log("Profit...");
        } else {
            console.log("loss...=" + ethers.formatUnits((amountIn - amountOut2), "ether") + " ether");
        }

    }

    for (let i = 0; i < 10; i++) {
        console.log(`Iteration: ${i}`);
        doStuff();
        await new Promise(resolve => setTimeout(resolve, 15000));;
    }



}



async function getConversionRateGeneric(config, provider, util, routerAddress, path, amountIn) {
    console.log("amountIn = " + amountIn);
    const routerAbi = [
        "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
    ];
    const router = new ethers.Contract(routerAddress, routerAbi, provider);
    let amountOut = 0;
    try {
        const amounts = await router.getAmountsOut(amountIn, path);
        amountOut = amounts[1];
        //console.log(`Conversion rate on ${routerAddress === config.UNISWAP_V2_ROUTER ? "Uniswap" : "SushiSwap"}:`);
        if (path[0] == config.WETH) {
            console.log(ethers.formatUnits(amountIn, "ether") + `  ETH = ${ethers.formatUnits(amountOut, 6)} USDT`);
        } else {
            console.log(amountIn, `USDC = ${ethers.formatUnits(amountOut, 12)} ETH `);
        }
        console.log("amountOut = " + amountOut);

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