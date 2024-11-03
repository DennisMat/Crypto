require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
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
        blockNumber: 21013574, //work for uniswap/sushiswap         
        enabled: true
      }
    },
    localhost: {
      url: "http://127.0.0.1:8545", // Default Hardhat network URL
      chainId: 31337
    }
    /*
    ,

	   sepolia: {
      url: 'https://eth-sepolia.g.alchemy.com/v2/vn2dImpiYQtHbjj_Vd04-VYBYT9uqztN',
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
	   mainnet: {
      url: 'https://eth-mainnet.g.alchemy.com/v2/vn2dImpiYQtHbjj_Vd04-VYBYT9uqztN',
      accounts: [SEPOLIA_PRIVATE_KEY],
    }
    */
    

	
  }
};
