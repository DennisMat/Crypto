// scripts/deploy.js
async function main () {
  /*
  // We get the contract to deploy
  const Box = await ethers.getContractFactory('Box');
  console.log('Deploying Box...');
  const box = await Box.deploy();
  await box.waitForDeployment();
  console.log('Box deployed to:', await box.getAddress());

  const EzSwap = await ethers.getContractFactory('EzSwap');
  console.log('Deploying EzSwap...');
  const e = await EzSwap.deploy();
  await e.waitForDeployment();
  console.log('Box deployed to:', await e.getAddress());
 */

  const TokenSwap = await ethers.getContractFactory('TokenSwap');

  console.log('Deploying TokenSwap...');
  const e = await TokenSwap.deploy();
  await e.waitForDeployment();
  console.log('Box deployed to:', await e.getAddress());


  
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
////run using npx hardhat run --network localhost scripts/deploy.js

