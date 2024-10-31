async function getLiquidity() {

    let config = "local";

    let deployedContractAddress;

    const local = true;
    if (local) {
        config = require("./config.local.json")
        const d = require("./deployTokenSwap.js")
        deployedContractAddress = await d.deploy(config);

    } else {
        const d = require("./deployTokenSwap.js")
        deployedContractAddress = await d.deploy(config);
        const config = require("./config.sepolia.json")
        //deployedContractAddress = "0x9Be00C3f5f56A6301b3e398Ea7a0493AA49EBe58";
    }

    console.log("Loaded config... env = " + config.env);
    const util = require("./util.js");

    const provider = new ethers.JsonRpcProvider(config.providerUrl);

    const tokenA = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // WETH
    const tokenB = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // DAI

    // Uniswap V2 factory address (Ethereum Mainnet)
    const UNISWAP_V2_FACTORY_ADDRESS = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

    // ABI for Uniswap V2 Factory and Pair contracts
    return await util.getLiquidity(config, provider, tokenA, tokenB);


}



getLiquidity()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });



