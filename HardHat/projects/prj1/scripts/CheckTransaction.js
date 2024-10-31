/*
const { Network, Alchemy } = require("alchemy-sdk");

const settings = {
    apiKey: "vn2dImpiYQtHbjj_Vd04-VYBYT9uqztN", // Replace with your Alchemy API Key
    //network: "http://127.0.0.1:8545/", // Replace with your network (e.g., Hardhat localnet)
    //network: "https://eth-mainnet.g.alchemy.com/v2/"
    // network:"eth-mainnet",//works
    //network:"localhost"
};
const alchemy = new Alchemy(settings);


//const txHash = "0xc0e3f734e576aebd79f416b9c3064162c7da7520e02f1378fed458b37658d4f5";
const txHash = "0x2e3a7c5491e546d0ba5a99b8dca1a8b24a21fd8601d14bedf69590a30e724fb7";

alchemy.core.getTransactionReceipt(txHash).then((tx) => {
    // Process the transaction receipt
    if (!tx) {
        console.log("Pending or Unknown Transaction");
    } else if (tx.status === 1) {
        console.log("Transaction was successful!");
        console.log("Transaction blockNumber " + tx.blockNumber);
        console.log("Transaction from " + tx.from);
        console.log("Transaction to " + tx.to);


    } else {
        console.log("Transaction failed!");
    }

});
console.log("Done");

*/

const walletAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
//const tokenAddress="0x1d87585df4d48e52436e26521a3c5856e4553e3f";
const tokenAddress = "0x1d87585df4d48e52436e26521a3c5856e4553e3f";

//checkAccounts();

//checkBalance(walletAddress, tokenAddress);

d();



async function checkAccounts() {
    const accounts = (await ethers.getSigners()).map(signer => signer.address);

    for (var i in accounts) {
        const bal1 = accounts[i] + " balance : " + await ethers.provider.getBalance(accounts[i]);
        console.log(bal1);
    }
}


function checkBalance(walletAddressA, tokenAddressA) {
    const { ethers } = require("ethers");

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // ERC-20 contract ABI (Application Binary Interface), minimal ABI to get balance
    const abi = [
        "function balanceOf(address owner) view returns (uint256)"
    ];

    // The address of the ERC-20 contract (token contract)
    const tokenAddress = tokenAddressA;  // Example: DAI contract address

    // The address you want to check the balance of
    const walletAddress = walletAddressA;

    // Create a new contract instance
    const contract = new ethers.Contract(tokenAddress, abi, provider);


    async function getTokenBalance() {
        // Get the token balance
        const balance = await contract.balanceOf(walletAddress);

        // Optionally format the balance depending on the token's decimals (usually 18 for ERC-20 tokens)
        const formattedBalance = ethers.utils.formatUnits(balance, 18);

        console.log('Token balance of address ${walletAddress}: ${formattedBalance}');
    }

    getTokenBalance().catch(console.error);

}

function checkReceipt() {
    const swapEventTopic = ethers.utils.id('Swap(address,uint256,uint256,uint256,uint256,address)')

    // discard all other logs
    const swapLogs = receipt.logs.filter(log => log.topics[0] === swapEventTopic);

    // take the last swap event
    const lastSwapEvent = swapLogs.slice(-1)[0]

    // decode the data
    const swapInterface = new ethers.utils.Interface(['event Swap (address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)'])
    const parsed = swapInterface.parseLog(lastSwapEvent);

    // use the non zero value
    const receivedTokens = parsed.args.amount0Out.isZero() ? parsed.args.amount1Out : parsed.args.amount0Out;



}

function d() {
    //const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const provider = new ethers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/vn2dImpiYQtHbjj_Vd04-VYBYT9uqztN");

    //
    //const receipt = provider.getTransactionReceipt("0x742ba794c140d11a794c1c9431ae0d919b9f4215655dd7b0e10f312f038e26a2");
    const receipt = provider.getTransactionReceipt("0x250b4652af34d18da19fe55a7b1739959c2851c239aaacbb7fbdfe5ad93670e4");


    // Get the Swap event topic
    const swapEventTopic = ethers.keccak256(ethers.toUtf8Bytes('Swap(address,uint256,uint256,uint256,uint256,address)'));
    console.log("receipt.logs  " + receipt.logs);
    // // Filter logs for the swap event topic
    // const swapLogs = receipt.logs.filter(log => log.topics[0] === swapEventTopic);
   
    // // Take the last swap event
    // const lastSwapEvent = swapLogs.at(-1); // Use .at(-1) in v6 instead of slice(-1)[0]

    // // Create an interface for the Swap event
    // const swapInterface = new ethers.Interface(['event Swap (address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)']);

    // // Parse the last swap event log
    // const parsed = swapInterface.decodeEventLog('Swap', lastSwapEvent.data, lastSwapEvent.topics);

    // // Use the non-zero value (amount0Out or amount1Out)
    // const receivedTokens = ethers.isZero(parsed.amount0Out) ? parsed.amount1Out : parsed.amount0Out;
    //const receivedTokens = parsed.args.amount0Out.isZero() ?  parsed.args.amount1Out : parsed.args.amount0Out;
    // console.log("receivedTokens  " + receivedTokens);    

}