async function main() {

    const util = require("./utils/util.js");
    const config = require("./config.local.json");
    const apikeyFile="C:/work/misc/keys.local.json";
    const configKey = require(apikeyFile);
    console.log("Loaded config... env = " + config.env);

    const fs = require('fs').promises;


    const provider = new ethers.JsonRpcProvider(config.providerUrl);
    const priKeyPayer = configKey.privateKeyPayerTest;
    const apiKeyArbarium = configKey.apiKeyArbarium;
    
    const axios = require('axios');

    const graphqlQuery = `{
      trades(orderBy: priceETH, orderDirection: desc) {
        priceETH
        tokenId
      }
    }`;
    const queryUrl =
     // 'https://gateway-arbitrum.network.thegraph.com/api/'+apiKeyArbarium+'/subgraphs/id/HdVdERFUe8h61vm2fDyycHgxjsde5PbB832NHgJfZNqK';
      'https://gateway.thegraph.com/api/'+apiKeyArbarium+'/subgraphs/id/HdVdERFUe8h61vm2fDyycHgxjsde5PbB832NHgJfZNqK'
    const graphQLRequest = {
      method: 'post',
      url: queryUrl,
      data: {
        query: graphqlQuery,
      },
    };
    
    // Send the `GraphQL` query
    const response = await axios(graphQLRequest);
      const data = response.data;
        console.log("yyy", response.errors);
        console.log(data);
      console.log("xxx");

    

}




main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });