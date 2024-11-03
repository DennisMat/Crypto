async function main() {
    const util = require("./util.js");
    const config = require("./config.local.json");
    console.log("Loaded config... env = " + config.env);
    const fs = require('fs').promises;


    const provider = new ethers.JsonRpcProvider(config.providerUrl);
      const signer = provider.getSigner();

      const inputToken = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"; // Example for ETH on Kyber
      const outputToken = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // Example for DAI
      const amountIn = ethers.parseEther("1"); // Amount in ETH (e.g., 1 ETH)
      





      const { KyberSDK   } = require("@kyberswap/aggregator-sdk");
      console.log(KyberSDK);
      
      // Step 3: Define Provider and Aggregator
  
      
      // Step 4: Set up KyberSwap Aggregator
      // const aggregator = KyberSDK.aggregator ({
      //     chainId: 1, // for Ethereum Mainnet, change as necessary (e.g., 137 for Polygon)
      //     provider: provider,
      // });
      

          // try {
          //     // Step 5: Fetch the Quote
          //     const quote = await KyberSDK.getQuote({
          //         inputToken: inputTokenAddress,
          //         outputToken: outputTokenAddress,
          //         amountIn: amountIn.toString(), // input amount as a string
          //         slippageTolerance: 50, // 0.5% slippage, adjust as needed
          //         recipient: config.payerAccount,
          //         deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from now
          //     });
      
          //     console.log(`Expected output: ${quote.outputAmount} (in wei)`);
          //     console.log(`Expected rate: ${quote.expectedRate}`);
          //     return quote;
          // } catch (error) {
          //     console.error("Error fetching quote:", error);
          // }
      
      
      

















  
    
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
