async function main() {

  const { provider, contract } = await TestUniswap();

}



main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });




async function TestUniswap() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  // Uniswap V2 Router contract address on Ethereum mainnet
  const routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  // Uniswap V2 Router ABI
  const contractAbi = [
    {
      "constant": true,
      "inputs": [],
      "name": "factory",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const contract = new ethers.Contract(routerAddress, contractAbi, provider);

  // Call the 'factory' function
  const factoryAddress = await contract.factory();
  console.log(`Uniswap V2 Factory Address: ${factoryAddress}`);
  return { provider, contract };
}
//run using npx hardhat run --network localhost scripts/index.js