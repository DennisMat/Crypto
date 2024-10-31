// for  https://docs.ethers.org/v4/cookbook-accounts.html

const ethers = require('ethers');

async function sweep(privateKey, targetAddress) {

    let provider = new ethers.JsonRpcProvider('http://localhost:8545');

    let wallet = new ethers.Wallet(privateKey, provider);

    // Make sure we are sweeping to an EOA, not a contract. The gas required
    // to send to a contract cannot be certain, so we may leave dust behind
    // or not set a high enough gas limit, in which case the transaction will
    // fail.
    let code = await provider.getCode(targetAddress);
    if (code !== '0x') { throw new Error('Cannot sweep to a contract'); }

    // Get the current balance

    let balance = await provider.getBalance(await wallet.getAddress());
    console.log('balance: ' + balance);

    // Normally we would let the Wallet populate this for us, but we
    // need to compute EXACTLY how much value to send
    let gasPrice = await provider.getFeeData.gasPrice;

    // The exact cost (in gas) to send to an Externally Owned Account (EOA)
    let gasLimit = 21000;

    // The balance less exactly the txfee in wei
    const amountInEther = '0.01';

    // let tx = await wallet.sendTransaction({
    //     gasLimit: gasLimit,
    //     gasPrice: gasPrice, 
    //     to: newAddress,
    //     value: value
    // });
    const value = 3;

    const tx = {
        to: newAddress,
        value: value,
        gasPrice: ethers.parseUnits('1000', 'gwei'),  // Specify the gas price
        gasLimit: 2100000,  // Gas limit for a standard Ether transfer
    };


    const transactionResponse = await wallet.sendTransaction(tx);
    console.log('Transaction sent! Waiting for confirmation...');
    const receipt = await transactionResponse.wait();
    // console.log('Transaction confirmed:', receipt);
    //console.log('Transaction details:', await receipt.getTransaction());


    let balanceNew = await provider.getBalance(await wallet.getAddress());
    console.log('balanceNew: ' + balanceNew);

};

//0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
const fromPvk = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const to = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

sweep(fromPvk, to);