async function main() {

const axios = require('axios');
const { Coinbase, Wallet } = require("@coinbase/coinbase-sdk");


const apikeyFile="C:/work/misc/cdp_api_key_DennisKey1.json";
const config = require(apikeyFile);
Coinbase.configureFromJson({ filePath: apikeyFile });

const resp = await Wallet.listWallets();
console.log(resp.data);

//from https://coinbase.github.io/coinbase-sdk-nodejs/index.html
// const wallet = await Wallet.create();

// A Wallet has a default Address.
const address = await wallet.getDefaultAddress();
console.log(`Address: ${address}`);
// Create a faucet request that returns you a Faucet transaction that can be used to track the tx hash.
const faucetTransaction = await wallet.faucet();
console.log(`Faucet transaction: ${faucetTransaction}`);
const seedFilePath = "";
wallet.saveSeed(seedFilePath);

const data = wallet.export();
console.log(data);


wallet.saveSeed(seedFilePath);

// to retive the wallet, method 1
const userWallet = await Wallet.fetch(wallet.getId());
await userWallet.loadSeed(seedFilePath);

// to retive the wallet, method 2
//const importedWallet = await Wallet.import(data);


// Address: WalletAddress{ addressId: '0x6aD8eF4eB94e90bffB34a606EbC2b498Ea7F2BFE', networkId: 'base-sepolia', walletId: '40598974-9ff9-4e1a-baba-f6a925eaf48a' }
// Faucet transaction: Coinbase::FaucetTransaction{transaction_hash: '0x7b4a17cffdbc308ce55c4c9c36f814677e614b19150267102df4bc1d48b246c0', transaction_link: 
// 'https://sepolia.basescan.org/tx/0x7b4a17cffdbc308ce55c4c9c36f814677e614b19150267102df4bc1d48b246c0'}



}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
