async function main() {
    const util = require("./utils/util.js");
    const config = require("./config.local.json");
    const apikeyFile="C:/work/misc/keys.local.json";
    const configKey = require(apikeyFile);
    console.log("Loaded config... env = " + config.env);
    const fs = require('fs').promises;



    const provider = new ethers.JsonRpcProvider(config.providerUrl);
    const priKeyPayer = configKey.privateKeyPayerTest

    const routerList = config.SWAP_PLATFORMS.Ethereum;
    const tokenList = config.tokens;

    const routerArr = [routerList.Uniswap_V3_Quoter, routerList.Uniswap_V2_Router, routerList.SushiSwap_Router];
    //const routerArr = [routerList.Uniswap_V3_Quoter];
    const tokenArr = [config.tokens.WETH, config.tokens.USDT, config.tokens.USDC,config.tokens.BAL ];
    // const tokenArr = [config.tokens.WETH, config.tokens.USDT, config.tokens.USDC];
    const routerTokenPairs = createCombinations(routerArr, tokenArr);

    const amountIn = ethers.parseUnits("1", "ether");

    let j = 0;
    while (j < 1) {
        for (let i = 0; i < routerTokenPairs.length; i++) {
            //console.log(routerTokenPairs[i] );
            j++;
             let logFileName = 'logs/log' + j + '.txt'; 
            threadedTask(config, provider, util, fs, logFileName, priKeyPayer, routerTokenPairs[i]);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

}




async function threadedTask(config, provider, util, fs, logFileName, priKeyPayer, routerTokenPair) {
    let routers = routerTokenPair[0];
    let tokens = routerTokenPair[1];

    //No need to use await here
    threadedTaskRouter(config, provider, util, fs, logFileName, priKeyPayer, routers[0], routers[1], tokens);
    //reverse the routers
    threadedTaskRouter(config, provider, util, fs, logFileName, priKeyPayer, routers[1], routers[0], tokens);
}


async function threadedTaskRouter(config, provider, util, fs, logFileName, priKeyPayer, router0, router1, tokens) {
    let amountInRaw = 10;

    if (tokens[0] != config.tokens.WETH) {
        amountInRaw = 10000;
    }

    let amountIn = BigInt(amountInRaw);
    if (tokens[0] == config.tokens.WETH) {
        amountIn = ethers.parseUnits(amountIn.toString(), "ether");//This is a bigInt (ECMAScript 2020 (ES2020))not  Big Number or bignumberis
    }


    const amountOut1 = await util.utilQuotes.getQuotes(config, provider, util, priKeyPayer, router0, tokens[0], tokens[1], amountIn);

    if (amountOut1 === BigInt(0)) {
        console.log("Conversion rate is zero, will not process this further...");
        return;
    }
    const amountOut2 = await util.utilQuotes.getQuotes(config, provider, util, priKeyPayer, router1, tokens[1], tokens[0], amountOut1);

    const textFigures = "(" + util.utilSearch.getRouterName(config, router0) + ")" + amountIn + "====>" + "(" + util.utilSearch.getRouterName(config, router1) + ")" + amountOut1 + "====>" + "(" + util.utilSearch.getRouterName(config, router0) + ")" + amountOut2;
    let textProfitLoss = "";

    if (amountIn < amountOut2) {

        textProfitLoss = " Profit = " + (amountOut2 - amountIn);
    } else {
        textProfitLoss = " Loss = " + (amountIn - amountOut2);
    }

    try {
        const logText = textFigures + textProfitLoss + "token combination = " + util.utilSearch.getTokenName(config, tokens[0])  +" "+ util.utilSearch.getTokenName(config, tokens[1]);
        console.log(logText);
        //fs.appendFile(logFileName, logText + "\n", 'utf8');
    } catch (error) {
       // console.error("Error getting conversion rate:", error);
    }

}

function createCombinations(routers, tokens) {
    let routerPairs = getPairs(routers);
    let tokenPairs = getPairs(tokens);
    let routerTokenPairs = [];
    for (let i = 0; i < routerPairs.length; i++) {
        for (let j = 0; j < tokenPairs.length; j++) {
            let routerTokenPair = [routerPairs[i], tokenPairs[j]];
            routerTokenPairs.push(routerTokenPair);
        }
    }
    return routerTokenPairs;
}


function getPairs(strArray) {
    let strPairs = [];
    for (let i = 0; i < strArray.length - 1; i++) {
        for (let j = i + 1; j < strArray.length; j++) {
            if (i != j) {
                let s = [strArray[i], strArray[j]];
                strPairs.push(s);
                //System.out.println(routers[i] + "-" + routers[j]);
            }
        }
    }
    return strPairs;
}

main();
