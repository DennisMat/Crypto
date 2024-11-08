async function getQuotes(config, provider, util, priKeyPayer, routerAddress, tokenIn, tokenOut, amountIn) {

    console.log("======================================");
    const routerList = config.SWAP_PLATFORMS.Ethereum;
    const routerName = util.utilSearch.getRouterName(config, routerAddress);


    let amountOut = 0;
    let tokenInName = util.utilSearch.getTokenName(config, tokenIn);
    let tokenOutName = util.utilSearch.getTokenName(config, tokenOut);
    try {
      

        if (routerName == util.utilSearch.getRouterName(config, routerList.Uniswap_V2_Router)) {
            amountOut = await getQuote_Uniswap_V2_Router(config, provider, util, priKeyPayer, routerAddress, tokenIn, tokenOut, amountIn);
        }else if (routerName == util.utilSearch.getRouterName(config, routerList.Uniswap_V3_Quoter)) {
            amountOut =await getQuote_Uniswap_V3_Quoter(config, provider, util, priKeyPayer, routerAddress, tokenIn, tokenOut, amountIn);

        }else if (routerName == util.utilSearch.getRouterName(config, routerList.Balancer_V2_Vault)) {
            amountOut=await getQuote_Balancer_V2_Vault(config, provider, util, priKeyPayer, routerAddress, tokenIn, tokenOut, amountIn);
        }

    } catch (error) {
        console.error("Error getting conversion rate:", error);
    }

    console.log("Conversion rate on " + routerName);

    let amountOutFormatted = amountOut;

    if (tokenInName == util.utilSearch.getTokenName(config, config.tokens.WETH)) {
        tokenInName = "ETH";
    }

    if (tokenOutName == util.utilSearch.getTokenName(config, config.tokens.WETH)) {
        amountOutFormatted = ethers.formatUnits(amountOut, 12)
        tokenOutName = "ETH";
    } else if (tokenOutName == util.utilSearch.getTokenName(config, config.tokens.DAI)) {
        amountOutFormatted = ethers.formatUnits(amountOut, 18)
    } else {
        amountOutFormatted = ethers.formatUnits(amountOut, 6)
    }
    console.log(amountIn + " " + tokenInName + " = " + amountOutFormatted + " " + tokenOutName);



    console.log("======================================");

    return amountOut;
}

async function getQuote_Uniswap_V2_Router(config, provider, util, priKeyPayer, routerAddress, tokenIn, tokenOut, amountIn) {
    const routerAbi = [
        "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
    ];
    const path = [tokenIn, tokenOut];
    const contract = new ethers.Contract(routerAddress, routerAbi, provider);
    const amounts = await contract.getAmountsOut(amountIn, path);
    return amounts[1];
}

async function getQuote_Uniswap_V3_Quoter(config, provider, util, priKeyPayer, routerAddress, tokenIn, tokenOut, amountIn) {
    const quoterAbi = [
        "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external view returns (uint256)"
    ];

    let wallet = new ethers.Wallet(priKeyPayer, provider);
    const contract = new ethers.Contract(routerAddress, quoterAbi, wallet);

    const fee = 300;


    //In the past quoteExactInputSingle using callStatic to avoid gas costs.
    // But in laterversion of ethers it atomatica;;y removes the cost of gas
    amountOut = await contract.quoteExactInputSingle(tokenIn, tokenOut, fee, amountIn,
        0,//use zero for max
    );

    return amountOut;
}

async function getQuote_Balancer_V2_Vault(config, provider, util, priKeyPayer, routerAddress, tokenIn, tokenOut, amountIn) {
    
    const vaultAbi = [
        "function queryBatchSwap(int256 kind,tuple(address tokenIn, uint256 amountIn)[] swaps, address[] assets, uint256[] userData) external view returns (int256[] memory amountsOut)"
    ];

    let wallet = new ethers.Wallet(priKeyPayer, provider);
    const contract = new ethers.Contract(routerAddress, vaultAbi, wallet);
    const swaps = [{
        tokenIn: tokenIn,
        amountIn: amountInReq.toString()
    }];

    const amounts = await contract.queryBatchSwap(
        0, // Swap kind (0 for swap exact in, 1 for swap exact out)
        swaps, path, []);
    amountOut = amounts[1];

    return amountOut;
}


module.exports = {
    getQuotes

}; 