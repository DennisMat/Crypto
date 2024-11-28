async function getQuotes(config, provider, util, priKeyPayer, routerAddress, tokenIn, tokenOut, amountIn) {

    //console.log("======================================");
    const routerList = config.SWAP_PLATFORMS.Ethereum;
    const routerName = util.utilSearch.getRouterName(config, routerAddress);

    let amountOut = BigInt(0);
    let tokenInName = util.utilSearch.getTokenName(config, tokenIn);
    let tokenOutName = util.utilSearch.getTokenName(config, tokenOut);
    try {


        if (routerName == util.utilSearch.getRouterName(config, routerList.Uniswap_V2_Router)) {
            amountOut = await getQuote_Uniswap_V2_Router(config, provider, util, priKeyPayer, routerAddress, tokenIn, tokenOut, amountIn);
        } else if (routerName == util.utilSearch.getRouterName(config, routerList.Uniswap_V3_Quoter)) {
            amountOut = await getQuote_Uniswap_V3_Quoter(config, provider, util, priKeyPayer, routerAddress, tokenIn, tokenOut, amountIn);

        } else if (routerName == util.utilSearch.getRouterName(config, routerList.SushiSwap_Router)) {
            amountOut = await getQuote_SushiSwap_Router(config, provider, util, priKeyPayer, routerAddress, tokenIn, tokenOut, amountIn);

        } else if (routerName == util.utilSearch.getRouterName(config, routerList.Balancer_V2_Vault)) {
            amountOut = await getQuote_Balancer_V2_Vault(config, provider, util, priKeyPayer, routerAddress, tokenIn, tokenOut, amountIn);
        } else if (routerName == util.utilSearch.getRouterName(config, routerList.PancakeSwap_V2_Router)) {
            console.log("DO NOT USE IN PROD!. This router is barely used on ETH mainnet");
            amountOut = await getQuote_PancakeSwap_V2_Router(config, provider, util, priKeyPayer, routerAddress, tokenIn, tokenOut, amountIn);
        } else if (routerName == util.utilSearch.getRouterName(config, routerList.PancakeSwap_V2_Quoter)) {
            console.log("DO NOT USE IN PROD!. This router is barely used on ETH mainnet");
            amountOut = await getQuote_PancakeSwap_V2_Quoter(config, provider, util, priKeyPayer, routerAddress, tokenIn, tokenOut, amountIn);

        }


        //console.log("amountOut= " + amountOut);
    } catch (error) {
        console.error("Error, router ", routerName, tokenInName, "===>", tokenOutName, "amount In=", amountIn)
        console.error("Error getting conversion rate:", error);
    }

    //console.log("Conversion rate on " + routerName);

    let amountOutFormatted = amountOut;

    if (tokenInName == util.utilSearch.getTokenName(config, config.tokens.WETH)) {
        tokenInName = "ETH";
    }

    if (tokenOutName == util.utilSearch.getTokenName(config, config.tokens.WETH)) {
        amountOutFormatted = ethers.formatUnits(amountOut, 12)
        tokenOutName = "ETH";
    } else {
        amountOutFormatted = ethers.formatUnits(amountOut, 18)
    }
    //console.log(amountIn + " " + tokenInName + " = " + amountOutFormatted + " " + tokenOutName);



    //console.log("======================================");

    return amountOut;
}

async function getQuote_Uniswap_V2_Router(config, provider, util, priKeyPayer, routerAddress, tokenIn, tokenOut, amountIn) {
    try {
        const routerAbi = [
            "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
        ];
        const path = [tokenIn, tokenOut];
        const contract = new ethers.Contract(routerAddress, routerAbi, provider);
        const amounts = await contract.getAmountsOut(amountIn, path);
        return amounts[1];
    } catch (error) {
        // console.error("Error getting conversion rate:", error);
    }
    return 0n;
}

async function getQuote_Uniswap_V2_Router(config, provider, util, priKeyPayer, routerAddress, tokenIn, tokenOut, amountIn) {
    try {
        const routerAbi = [
            "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
        ];
        const path = [tokenIn, tokenOut];
        const contract = new ethers.Contract(routerAddress, routerAbi, provider);
        const amounts = await contract.getAmountsOut(amountIn, path);
        return amounts[1];
    } catch (error) {
        // console.error("Error getting conversion rate:", error);
    }
    return 0n;
}

async function getQuote_PancakeSwap_V2_Router(config, provider, util, priKeyPayer, routerAddress, tokenIn, tokenOut, amountIn) {
    try {
        const routerAbi = [
            "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
        ];
        const path = [tokenIn, tokenOut];
        const contract = new ethers.Contract(routerAddress, routerAbi, provider);
        const amounts = await contract.getAmountsOut(amountIn, path);
        return amounts[1];
    } catch (error) {
        // console.error("Error getting conversion rate:", error);
    }
    return 0n;
}
async function getQuote_SushiSwap_Router(config, provider, util, priKeyPayer, routerAddress, tokenIn, tokenOut, amountIn) {
    try {

        const routerAbi = [
            "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
        ];
        const path = [tokenIn, tokenOut];
        const contract = new ethers.Contract(routerAddress, routerAbi, provider);
        const amounts = await contract.getAmountsOut(amountIn, path);
        return amounts[1];
    } catch (error) {
        // console.error("Error getting conversion rate:", error);
    }
    return 0n;

}

async function getQuote_Uniswap_V3_Quoter(config, provider, util, priKeyPayer, routerAddress, tokenIn, tokenOut, amountIn) {
    try {
        const quoterAbi = [
            "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external view returns (uint256)"
        ];

        let wallet = new ethers.Wallet(priKeyPayer, provider);
        const contract = new ethers.Contract(routerAddress, quoterAbi, wallet);
        const fee = 3000; //Note! a low fee will not throw an error it will return a 0 amountOut
        //In the past quoteExactInputSingle using callStatic to avoid gas costs.
        // But in laterversion of ethers it atomatica;lly removes the cost of gas
        amountOut = await contract.quoteExactInputSingle(tokenIn, tokenOut, fee, amountIn,
            0,//use zero for max
        );

        return amountOut;
    } catch (error) {
        // console.error("Error getting conversion rate:", error);
    }
    return 0n;
}
async function getQuote_PancakeSwap_V2_Quoter(config, provider, util, priKeyPayer, routerAddress, tokenIn, tokenOut, amountIn) {
    try {
        const quoterAbi = [
            "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external view returns (uint256)"
        ];

        let wallet = new ethers.Wallet(priKeyPayer, provider);
        const contract = new ethers.Contract(routerAddress, quoterAbi, wallet);
        const fee = 3000; //Note! a low fee will not throw an error it will return a 0 amountOut
        //In the past quoteExactInputSingle using callStatic to avoid gas costs.
        // But in laterversion of ethers it atomatica;lly removes the cost of gas
        amountOut = await contract.quoteExactInputSingle(tokenIn, tokenOut, fee, amountIn,
            0,//use zero for max
        );

        return amountOut;
    } catch (error) {
        // console.error("Error getting conversion rate:", error);
    }
    return 0n;
}



// work is incomplete, work on this later.
async function getQuote_Balancer_V2_Vault(config, provider, util, priKeyPayer, routerAddress, tokenIn, tokenOut, amountIn) {
    //https://docs.balancer.fi/
    const vaultAbi = [
        "function queryBatchSwap(int256 kind,tuple(address tokenIn, uint256 amountIn)[] swaps, address[] assets, uint256[] userData) external view returns (int256[] memory amountsOut)"
    ];

    //let wallet = new ethers.Wallet(priKeyPayer, provider);
    const contract = new ethers.Contract(routerAddress, vaultAbi, provider);
    /*  const swaps = [{
        tokenIn: tokenIn,
        amountIn: amountIn
    }];

    const amounts = await contract.queryBatchSwap(
        0, // Swap kind (0 for swap exact in, 1 for swap exact out)
        swaps, path, []);
        */

    const swaps = [
        {
            poolId: "0x...yourPoolId...",          // Replace with the specific pool ID you’re swapping with
            assetInIndex: 0,                        // Index in the assets array for the token being swapped in
            assetOutIndex: 1,                       // Index in the assets array for the token being swapped out
            amount: ethers.utils.parseUnits("1.0", 18), // Amount of input token (1.0 token with 18 decimals)
            userData: "0x"                          // User data (often "0x" if not required by the pool type)
        }
    ];

    const assets = [
        tokenIn, // Replace with the token in address
        tokenOut  // Replace with the token out address
    ];

    // Define Funds structure
    const funds = {
        sender: config.payerAccount,
        fromInternalBalance: false,
        recipient: config.payerAccount,
        toInternalBalance: false
    };



    const amounts = await contract.queryBatchSwap(swapKind, swaps, assets, funds);
    amountOut = amounts[1];

    return amountOut;
}


module.exports = {
    getQuotes

}; 