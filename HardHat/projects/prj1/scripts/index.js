async function main() {
  const accounts = (await ethers.getSigners()).map(signer => signer.address);
  // console.log(accounts);


  // Contract deployment: Box
  // Contract address:    0xe58cbe144dd5556c84874dec1b3f2d0d6ac45f1b
  // Transaction:         0x1153c5ce205c355c3a3dfa94e5782495659f2d7613c2259788a53df75fc99e88
  // From:                0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
  // Value:               0 ETH
  // Gas used:            103113 of 30000000
  // Block #21004214:     0xaf78f3f3f0d0ba6f2e84eed997ee5b6f8b4b95212a7219e0f3044d7892de838c

  const address = '0xC1dC7a8379885676a6Ea08E67b7Defd9a235De71';
  const Box = await ethers.getContractFactory('Box');
  const box = Box.attach(address);
  await box.store(27);
  const value = await box.retrieve();
  console.log('Box value is', value.toString());
  // Send a transaction to store() a new value in the Box
  await box.store(23);

  // Call the retrieve() function of the deployed Box contract
  const value1 = await box.retrieve();
  console.log('Box value is', value1.toString());

  //const bal = await ethers.provider.getBalance(address);

  //console.log(bal);

  for (var i in accounts) {
    const bal1 = accounts[i] + " : " + await ethers.provider.getBalance(accounts[i]);
    console.log(bal1);
  }


}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

//run using npx hardhat run --network localhost scripts/index.js