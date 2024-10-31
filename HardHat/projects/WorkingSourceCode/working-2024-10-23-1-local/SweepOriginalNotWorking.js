// for  https://docs.ethers.org/v4/cookbook-accounts.html

const ethers = require('ethers');

async function sweep(privateKey, newAddress) {

    let provider = ethers.getDefaultProvider();

    let wallet = new ethers.Wallet(privateKey, provider);

    // Make sure we are sweeping to an EOA, not a contract. The gas required
    // to send to a contract cannot be certain, so we may leave dust behind
    // or not set a high enough gas limit, in which case the transaction will
    // fail.
    let code = await provider.getCode(newAddress);
    if (code !== '0x') { throw new Error('Cannot sweep to a contract'); }

    // Get the current balance
    let balance = await wallet.getBalance();

    // Normally we would let the Wallet populate this for us, but we
    // need to compute EXACTLY how much value to send
    let gasPrice = await provider.getGasPrice();

    // The exact cost (in gas) to send to an Externally Owned Account (EOA)
    let gasLimit = 21000;

    // The balance less exactly the txfee in wei
    let value = balance.sub(gasPrice.mul(gasLimit))

    let tx = await wallet.sendTransaction({
        gasLimit: gasLimit,
        gasPrice: gasPrice,
        to: newAddress,
        value: value
    });

    console.log('Sent in Transaction: ' + tx.hash);
};

const fromPvk ='0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
const to = '0xe58cBE144dD5556C84874deC1b3F2d0D6Ac45F1b';

sweep(fromPvk, to);