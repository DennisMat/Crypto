async function deploy () {

    const { abi, bytecode } = require("../artifacts/contracts/TokenSwap.sol/TokenSwap.json");
     
    
     const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
     const priKeyPayer = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
   
     // Create a wallet (replace with your private key)
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
   
     let deployedAddress=await contract.getAddress();
   
     console.log("Contract deployed at address:", await contract.getAddress());
     return deployedAddress;
   }
   module.exports = { deploy }; 