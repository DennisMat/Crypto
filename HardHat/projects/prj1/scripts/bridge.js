async function main() {

const axios = require('axios');
const { Coinbase, Wallet } = require("@coinbase/coinbase-sdk");


const apikeyFile="C:/work/misc/cdp_api_key_DennisKey1.json";
const config = require(apikeyFile);
Coinbase.configureFromJson({ filePath: apikeyFile });

const resp = await Wallet.listWallets();
console.log(resp.data);


// constructor




}




main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
