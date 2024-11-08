async function main() {

    require('dotenv').config();
    const util = require("../../prj1/scripts/utils/util.js");
    const config = require("../../prj1/scripts/config.local.json");
    console.log("Loaded config... env = " + config.env);
    // const {
    //     BigNumber,
    //     bigNumberify,
    //     getAddress,
    //     keccak256,
    //     defaultAbiCoder,
    //     toUtf8Bytes,
    //     solidityPack
    //   } from 'ethers/utils'


    const provider = new ethers.JsonRpcProvider(config.providerUrl);
    const priKeyPayer = process.env.priKeyPayerTest

    const routerList = config.SWAP_PLATFORMS.Ethereum;
    const tokenList = config.tokens;

    const routerArr=[routerList.Uniswap_V2_Router,routerList.SushiSwap_Router];
    const tokenArr = [config.tokens.WETH,config.tokens.USDT,config.tokens.USDC];

    const routerTokenPairs=createCombinations(routerArr, tokenArr);

  

       // await util.utilQuotes.getQuotes(config, provider, util, priKeyPayer,routerList.Uniswap_V2_Router, config.tokens.WETH, config.tokens.USDT, 1);
        //await util.utilQuotes.getQuotes(config, provider, util, priKeyPayer,routerList.Uniswap_V2_Router,  config.tokens.USDC, config.tokens.WETH, 1000);
        // await util.utilQuotes.getQuotes(config, provider, util, priKeyPayer,routerList.Uniswap_V3_Quoter, config.tokens.WETH, config.tokens.DAI, 1);
        // await getConversionRateGeneric(config, provider, util, priKeyPayer, routerList.Uniswap_V3_Quoter, [config.WETH, config.DAI], "1");

        // await getConversionRateGeneric(config, provider, util, priKeyPayer, routerList.Balancer_V2_Vault, [config.WETH, config.DAI], "1");


    for (let i = 0; i < routerTokenPairs.length; i++) {

    //for (let i = 0; i < 1; i++) {
			
			
        // console.log(util.utilSearch.getRouterName(config, routerTokenPairs[i][0][0]) + "-" + util.utilSearch.getRouterName(config, routerTokenPairs[i][0][1])
        //        + ", "+ util.utilSearch.getTokenName(config, routerTokenPairs[i][1][0]) + "-" + util.utilSearch.getTokenName(config,routerTokenPairs[i][1][1])
        //         );

                threadedTask(config, provider, util, priKeyPayer,routerTokenPairs[i]);

   }

 


}




async function threadedTask(config, provider, util, priKeyPayer,routerTokenPair) {
    

     let routers=routerTokenPair[0];
     let tokens=routerTokenPair[1];

     let amountIn=1;

     if(tokens[0]!=config.tokens.WETH){
        amountIn=1000;
     }

     let amountInReq = amountIn;
     if (tokens[0] == config.tokens.WETH ){
         amountInReq = ethers.parseUnits(amountIn.toString(), "ether");//This is a bigInt (ECMAScript 2020 (ES2020))not  Big Number or bignumberis
     }else{
         //amountInReq=amountIn.toString();
     }

     const amountOut1=  await util.utilQuotes.getQuotes(config, provider, util, priKeyPayer, routers[0], tokens[0],tokens[1], amountInReq);
     const amountOut2=  await util.utilQuotes.getQuotes(config, provider, util, priKeyPayer, routers[1], tokens[1],tokens[0],  amountOut1);

     console.log(amountInReq,"====>", amountOut1,"====>", amountOut2);

     

     if (amountInReq<amountOut2) {
        console.log("Profit. Amount in = ", amountInReq, " amountOut =" , amountOut2 );
    }else{
        console.log("Loss. Amount in = ", amountInReq, " amountOut =" , amountOut2 );
    }


    //  if (amountIn < amountOut2) {
    //     logText="Profit " + ethers.formatUnits((amountOut2-amountIn), "ether") + " ether";
    // } else {
    //     logText="Loss =" + ethers.formatUnits((amountIn - amountOut2), "ether") + " ether";
    // }
    // console.log(logText);




}

function createCombinations(routers, tokens){
    let routerPairs = getPairs(routers);
    let tokenPairs = getPairs(tokens);
    let routerTokenPairs = [];
    for (let i = 0; i < routerPairs.length; i++) {
        for (let j = 0; j < tokenPairs.length; j++) {
            let routerTokenPair= [routerPairs[i],tokenPairs[j]];
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
                let s = [ strArray[i], strArray[j] ];
                strPairs.push(s);
                //System.out.println(routers[i] + "-" + routers[j]);
            }
        }

    }
    return strPairs;
}
main();
