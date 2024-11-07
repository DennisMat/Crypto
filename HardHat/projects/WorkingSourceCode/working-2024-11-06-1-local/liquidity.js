async function getLiquidity() {

    require('dotenv').config();
    const util = require("../../prj1/scripts/util.js");
    const config = require("../../prj1/scripts/config.local.json");
    console.log("Loaded config... env = " + config.env);


    const routerList = config.SWAP_PLATFORMS.Ethereum;
    const provider = new ethers.JsonRpcProvider(config.providerUrl);

    await util.getLiquidity(config, provider, routerList.UNISWAP_V2_FACTORY_ADDRESS, config.WETH, config.DAI);

    await util.getTokensInPool(config, provider, util,routerList.UNI_FACTORY,config.USDC, config.WETH);


}



getLiquidity()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });



