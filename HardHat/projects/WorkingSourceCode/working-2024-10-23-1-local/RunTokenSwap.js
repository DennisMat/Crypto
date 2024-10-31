

// local fork of mainnet

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
//  Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
const priKeyPayer = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
//This works. this is a token pool, and has no ETH, investigate if this is correct.
const uniswapWETHTokenSourceAddress = "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984";// this is a token pool, and has no ETH


/* sepolia


const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
//  Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
const priKeyPayer = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
//This works. this is a token pool, and has no ETH, investigate if this is correct.
const uniswapWETHTokenSourceAddress = "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984";// this is a token pool, and has no ETH

*/

//uniswapWETHTokenSourceAddress=USDC;
/*Important the line below will not work if its given 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
because of the error:
 error UniswapV2Library: IDENTICAL_ADDRESSES'
This is because uniswapRouter.WETH() gives the value 0xC02....
It looks like the router address: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D and 0xC02.... are some kind of pairs
*/

async function main() {
    const d = require("./deployTokenSwap.js")
    const deployedContractAddress = await d.deploy();
    await checkAccounts();
    await sendEtherToGetTokenOnlyForDemo(deployedContractAddress);
    await checkAccounts();
    await sendEtherToGetTokenLessGas(deployedContractAddress);
    await checkAccounts();
    // await recieveEtherUsingTokens(deployedContractAddress);
    // await checkAccounts();


}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


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

async function checkAccounts() {
    const accounts = (await ethers.getSigners()).map(signer => signer.address);

    // for (var i in accounts) {
    const bal1 = accounts[0] + " balance : " + await ethers.provider.getBalance(accounts[0]);
    console.log(bal1);
    // }
}  