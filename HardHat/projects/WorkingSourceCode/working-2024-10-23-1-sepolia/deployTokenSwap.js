async function deploy(config) {

  const { abi, bytecode } = require("../artifacts/contracts/TokenSwap.sol/TokenSwap.json");

  //const config = require("./config.local.json")

  const provider = new ethers.JsonRpcProvider(config.providerUrl);
  const priKeyPayer = config.priKeyPayer;


  const wallet = new ethers.Wallet(priKeyPayer, provider);

  const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);

  const options = {
    gasPrice: ethers.parseUnits('50', 'gwei'),  // Set gas price (in gwei)
    gasLimit: 5000000  // Set gas limit (number of gas units)
  };


  // Deploy the contract with the custom gas settings
  const contract = await contractFactory.deploy(options);

  await contract.waitForDeployment();

  console.log("Contract successfully deployed!");

  let deployedAddress = await contract.getAddress();

  console.log("Contract deployed at address:", await contract.getAddress());
  return deployedAddress;
}
module.exports = { deploy }; 