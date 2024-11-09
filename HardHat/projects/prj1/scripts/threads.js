async function main() {

    require('dotenv').config();
    const util = require("../../prj1/scripts/utils/util.js");
    const config = require("../../prj1/scripts/config.prod.json");
    console.log("Loaded config... env = " + config.env);



    const provider = new ethers.JsonRpcProvider(config.providerUrl);
    const priKeyPayer = process.env.priKeyPayerTest

    const routerList = config.SWAP_PLATFORMS.Ethereum;
    const tokenList = config.tokens;

    const routerArr = [routerList.Uniswap_V3_Quoter,routerList.Uniswap_V2_Router, routerList.SushiSwap_Router];
    const tokenArr = [config.tokens.WETH, config.tokens.USDT, config.tokens.USDC];

    const routerTokenPairs = createCombinations(routerArr, tokenArr);

    const amountIn = ethers.parseUnits("1", "ether");

     //await util.utilQuotes.getQuotes(config, provider, util, priKeyPayer,routerList.Uniswap_V2_Router, config.tokens.WETH, config.tokens.USDC, 10000000000000000n);
    //await util.utilQuotes.getQuotes(config, provider, util, priKeyPayer,routerList.Uniswap_V2_Router,  config.tokens.USDC, config.tokens.WETH, 1000000n);//works
    //await util.utilQuotes.getQuotes(config, provider, util, priKeyPayer,routerList.Uniswap_V3_Quoter, config.tokens.DAI, config.tokens.WETH,1000000n);//works
    await util.utilQuotes.getQuotes(config, provider, util, priKeyPayer,routerList.SushiSwap_Router, config.tokens.WETH, config.tokens.USDC,1000000000000n);//works
   
     //await util.utilQuotes.getQuotes(config, provider, util, priKeyPayer, routerList.Balancer_V2_Vault, config.tokens.WETH, config.tokens.DAI, ethers.parseUnits("1", "ether"));


    for (let i = 0; i < routerTokenPairs.length; i++) {
        threadedTask(config, provider, util, priKeyPayer, routerTokenPairs[i]);
    }

}




async function threadedTask(config, provider, util, priKeyPayer, routerTokenPair) {


    let routers = routerTokenPair[0];
    let tokens = routerTokenPair[1];

   //No need to use await here
    threadedTaskRouter(config, provider, util, priKeyPayer, routers[0], routers[1], tokens) ;
    //reverse the routers
    threadedTaskRouter(config, provider, util, priKeyPayer, routers[1], routers[0], tokens) ; 


}


async function threadedTaskRouter(config, provider, util, priKeyPayer, router0, router1, tokens) {
    let amountInRaw = 10;

    if (tokens[0] != config.tokens.WETH) {
        amountInRaw = 10000;
    }

    let amountIn = amountInRaw;
    if (tokens[0] == config.tokens.WETH) {
        amountIn = ethers.parseUnits(amountIn.toString(), "ether");//This is a bigInt (ECMAScript 2020 (ES2020))not  Big Number or bignumberis
    } else {
        //amountInReq=amountIn.toString();
    }
    const amountOut1 = await util.utilQuotes.getQuotes(config, provider, util, priKeyPayer, router0, tokens[0], tokens[1], amountIn);
    const amountOut2 = await util.utilQuotes.getQuotes(config, provider, util, priKeyPayer, router1, tokens[1], tokens[0], amountOut1);

    console.log("(",util.utilSearch.getRouterName(config,router0),")",amountIn, "====>", "(",util.utilSearch.getRouterName(config,router1),")",amountOut1, "====>","(",util.utilSearch.getRouterName(config,router0),")",amountOut2);
  



    if (amountIn < amountOut2) {
        console.log("Profit. Amount in = ", amountIn, " amountOut =", amountOut2);
    } else {
        console.log("Loss. Amount in = ", amountIn, " amountOut =", amountOut2);
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
