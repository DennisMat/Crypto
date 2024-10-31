async function checkAccountBalance(address) {
    const accounts = (await ethers.getSigners()).map(signer => signer.address);

    // for (var i in accounts) {
    const bal1 = "account: " +address + " balance : " + await ethers.provider.getBalance(address);
    console.log(bal1);
    // }
}

module.exports = { checkAccountBalance }; 