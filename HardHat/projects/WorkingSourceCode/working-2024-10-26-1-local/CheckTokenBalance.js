async function main() {

    let config = require("./config.local.json")

    console.log("Loaded config... env = " + config.env);
    const util = require("./util.js");

    const provider = new ethers.JsonRpcProvider(config.providerUrl);

    const addressToCheck="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // this can be any address.
    await util.getTokenBalances(config, provider,addressToCheck );
    await util.getSpecificTokenBalance(config, provider, config.DAI, addressToCheck);
     

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

