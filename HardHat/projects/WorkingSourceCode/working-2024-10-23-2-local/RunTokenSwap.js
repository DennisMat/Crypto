


async function main() {
    const d = require("./deployTokenSwap.js")
    const deployedContractAddress = await d.deploy();

    const config = require("./config.local.json")
    console.log("Loading config...");

    const util= require("./util.js");

    const provider = new ethers.JsonRpcProvider(config.providerUrl);
    const priKeyPayer = config.priKeyPayer;

    const DAI = config.DAI;
    const USDC = config.USDC;


/*Important the line below will not work if its given 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
because of the error:
 error UniswapV2Library: IDENTICAL_ADDRESSES'
This is because uniswapRouter.WETH() gives the value 0xC02....
It looks like the router address: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D and 0xC02.... are some kind of pairs
*/
    //This works. this is a token pool, and has no ETH, investigate if this is correct.
    const uniswapWETHTokenSourceAddress = config.uniswapWETHTokenSourceAddress;

    console.log("Loading config uniswapWETHTokenSourceAddress..." + uniswapWETHTokenSourceAddress);

    await util.checkAccountBalance(config.payerAccount);
    await sendEtherToGetTokenOnlyForDemo(deployedContractAddress);
   // await util.checkAccountBalance(config.payerAccount);
    await sendEtherToGetTokenLessGas(deployedContractAddress);
    //await util.checkAccountBalance(config.payerAccount);
    // await recieveEtherUsingTokens(deployedContractAddress);
    // await checkAccounts();





    async function sendEtherToGetTokenLessGas(deployedContractAddress) {
        console.log("Before swap  ETH for tokens. Less gas version ...");
        let signer = new ethers.Wallet(priKeyPayer, provider);
        const contractABIGetTokens = [
            {
                "inputs": [],
                "name": "buyTokensWithETHLessGas",
                "outputs": [],
                "stateMutability": "payable",  // Notice it's a payable function
                "type": "function"
            }
        ];
        const contract = new ethers.Contract(deployedContractAddress, contractABIGetTokens, signer);
        const amountOutMin = ethers.parseUnits("1.0", 18);

        try {
            const tx = await contract.buyTokensWithETHLessGas({
                gasPrice: ethers.parseUnits('10000', 'gwei'),  // Specify the gas price
                gasLimit: 2100000,  // Gas limit for a standard Ether transfer
                value: ethers.parseEther("20.0")
            });
            await tx.wait();  // Wait for the transaction to be confirmed
            console.log("After swap  ETH for tokens. Less gas version ...");
        } catch (error) {
            console.error("Error sending Ether:", error);
        }

    }

    /*Not working
    */
    async function receiveEtherToGetTokenLessGas(deployedContractAddress) {
        console.log("Before swap tokens to ETH. Less gas version ...");
        let signer = new ethers.Wallet(priKeyPayer, provider);
        const contractABIGetTokens = [
            {
                "inputs": [],
                "name": "getETHForTokensLessGas",
                "outputs": [],
                "stateMutability": "payable",  // Notice it's a payable function
                "type": "function"
            }
        ];
        const contract = new ethers.Contract(deployedContractAddress, contractABIGetTokens, signer);
        try {
            const tx = await contract.getETHForTokensLessGas({
                gasPrice: ethers.parseUnits('10000', 'gwei'),  // Specify the gas price
                gasLimit: 2100000,  // Gas limit for a standard Ether transfer
                value: ethers.parseEther("20.0")
            });
            await tx.wait();  // Wait for the transaction to be confirmed
            console.log("After swap  token to ETH. Less gas version ...");
        } catch (error) {
            console.error("Error sending Ether:", error);
        }

    }

    async function sendEtherToGetTokenOnlyForDemo(deployedContractAddress) {

        console.log("Before swap  ETH for tokens. More gas version ...");

        let signer = new ethers.Wallet(priKeyPayer, provider);

        const contractABIGetTokens = [
            {
                "inputs": [{
                    "internalType": "address",
                    "name": "tokenSourceAddress",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenAmountOutMin",
                    "type": "uint256"
                }],
                "name": "buyTokensWithETHMoreGas",
                "outputs": [],
                "stateMutability": "payable",  // Notice it's a payable function
                "type": "function"
            }
        ];

        const contract = new ethers.Contract(deployedContractAddress, contractABIGetTokens, signer);

        const amountOutMin = ethers.parseUnits("1.0", 18);

        try {
            const tx = await contract.buyTokensWithETHMoreGas(uniswapWETHTokenSourceAddress, amountOutMin, {
                gasPrice: ethers.parseUnits('10000', 'gwei'),  // Specify the gas price
                gasLimit: 2100000,  // Gas limit for a standard Ether transfer
                value: ethers.parseEther("20.0")
            });

            await tx.wait();  // Wait for the transaction to be confirmed

            console.log("After swap  ETH => Tokens. More gas version ...");

        } catch (error) {
            console.error("Error sending Ether:", error);
        }

    }

    async function recieveEtherUsingTokens(deployedContractAddress) {


        let wallet = new ethers.Wallet(priKeyPayer, provider);

        /*
        const contractABIGetETHForTokens = [
            {
                "inputs": [{
                    "internalType": "address",
                    "name": "tokenSourceAddress",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "tokenAmountIn",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "ethAmountOutMin",
                    "type": "uint256"
                }],
                "name": "recieveETHForTokens",
                "outputs": [],
                "stateMutability": "nonpayable",  // Notice it's a nonpayable function
                "type": "function"
            }
        ];
    
        */

        const contractABIGetETHForTokens = [
            "function recieveETHForTokensFullVersion( address tokenSourceAddress, uint tokenAmountOut, uint ethAmountInMin ) public"
        ]

        const contract = new ethers.Contract(deployedContractAddress, contractABIGetETHForTokens, wallet);

        const ethAmountInMin = ethers.parseUnits("1.0", 18);
        const tokenAmountOut = ethers.parseEther("20.0");



        // Step 4: Call the contract function and send Ether
        try {
            /*
            const tx = await contract.recieveETHForTokens(uniswapWETHTokenSourceAddress, tokenAmountOut, ethAmountInMin, {
                gasPrice: ethers.parseUnits('10000', 'gwei'),  // Specify the gas price
                gasLimit: 2100000,  // Gas limit for a standard Ether transfer
                value: ethers.parseEther("2000.0")
            });
    */
            const tx = await contract.recieveETHForTokensFullVersion(uniswapWETHTokenSourceAddress, tokenAmountOut, ethAmountInMin, {
                //gasPrice: ethers.parseUnits('100000', 'gwei'),  // Specify the gas price
                //gasLimit: 21000000,  // Gas limit for a standard Ether transfer
                //value: ethers.parseEther("2000.0")
            });

            await tx.wait();  // Wait for the transaction to be confirmed

            console.log("After swap  Tokens => ETH. More gas version ...");


        } catch (error) {
            console.error("Error sending Ether:", error);
        }

    }

   


}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

