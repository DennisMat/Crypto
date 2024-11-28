require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
//require("@uniswap/sdk-core");
require("hardhat-tracer");
require('dotenv').config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.19", // Specify the Solidity version
    settings: {
      optimizer: {
        enabled: true,   // Enable the optimizer
        runs: 200        // Number of optimization runs
      }
    }
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.g.alchemy.com/v2/vn2dImpiYQtHbjj_Vd04-VYBYT9uqztN",
        //blockNumber: 21010615, // optional, defaults to latest block
        //blockNumber: 21013574, //work for uniswap/sushiswap 
       // blockNumber:21132290,
        

        
        enabled: true
      }
    },
    localhost: {
      url: "http://127.0.0.1:8545", // Default Hardhat network URL
      chainId: 31337
    },
    arbitrumSepolia: {
      url: 'https://sepolia-rollup.arbitrum.io/rpc',
      chainId: 421614,
      //accounts: ["vn2dImpiYQtHbjj_Vd04-VYBYT9uqztN"]
    },
    arbitrumOne: {
      url: 'https://arb1.arbitrum.io/rpc',
      //accounts: ["535fece3fe113d3ff0e5490aab2b2fb7"]
    }
    /*
    ,

	   sepolia: {
      url: 'https://eth-sepolia.g.alchemy.com/v2',
      accounts: ["vn2dImpiYQtHbjj_Vd04-VYBYT9uqztN"],
    },
	   mainnet: {
      url: 'https://eth-mainnet.g.alchemy.com/v2',
      accounts: ["vn2dImpiYQtHbjj_Vd04-VYBYT9uqztN"],
    }
    */
    

	
  }
};
