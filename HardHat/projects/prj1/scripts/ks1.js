async function main() {
    const util = require("./util.js");

    
    
    const axios = require("axios");
const { ethers } = require("ethers");
const config = require("./config.prod.json");
    console.log("Loaded config... env = " + config.env);



    const inputTokenAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"; // ETH on 1inch
    const outputTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // DAI
    const amountIn = "1"; // Amount in ETH as a string


    const provider = new ethers.JsonRpcProvider(config.providerUrl);

    const chainId = 1; // Ethereum mainnet

    // Ensure amountIn is a valid numeric string
    if (typeof amountIn !== "string" || isNaN(Number(amountIn))) {
        throw new Error("amountIn must be a valid numeric string.");
    }

    // Convert amountIn to the correct BigNumber format
    const amount = ethers.parseUnits(amountIn, 18);
    
    const response = await axios.get(`https://api.1inch.io/v5.0/${chainId}/quote`, {
        params: {
            fromTokenAddress: inputTokenAddress,
            toTokenAddress: outputTokenAddress,
            amount: amount.toString(), // amount in wei
        },
        headers: {
            "User-Agent": "Mozilla/5.0", // Set a User-Agent header
        },
    });

    // Check if the response contains the expected data
    if (response.data && response.data.toTokenAmount) {
        const quote = response.data;

        // Extract relevant data from the response
        const outputAmount = ethers.utils.formatUnits(quote.toTokenAmount, 18); // Adjust decimals per token requirements
        console.log(`Input Amount: ${amountIn} ${inputTokenAddress}`);
        console.log(`Expected Output: ${outputAmount} ${outputTokenAddress}`);
        console.log(`Estimated Gas: ${quote.estimatedGas}`);
        return quote;
    } else {
        console.log(response);
        throw new Error("Unexpected response format from 1inch API.");
    }
  
 
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
