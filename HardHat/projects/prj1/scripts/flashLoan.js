async function executeFlashLoan() {

    const util = require("./util.js");
    const config = require("./config.local.json");
    console.log("Loaded config... env = " + config.env);

// Replace with your Alchemy/Infura project URL
//const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
const provider = new ethers.JsonRpcProvider(config.providerUrl);

// Replace with your wallet private key
//const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const wallet = new ethers.Wallet(config.priKeyPayer, provider);


// Balancer Vault Address
const VAULT_ADDRESS = "0xBA12222222228d8Ba445958a75a0704d566BF2C8"; // Mainnet Vault address

// ABI of the Vault contract (only relevant parts)
const vaultAbi = [
  "function flashLoan(address recipient, address[] memory tokens, uint256[] memory amounts, bytes memory userData) external"
];

// ABI of the token contract to approve transfers (ERC20 standard)
const erc20Abi = [
  "function approve(address spender, uint256 amount) public returns (bool)"
];

const nonce = await provider.getTransactionCount(VAULT_ADDRESS, "latest");
  console.log("Transaction Count (Nonce):", nonce);

  const deploymentTxOverrides = {
    nonce: (nonce + 1),
};

// Load contract instances
const vault = new ethers.Contract(VAULT_ADDRESS, vaultAbi, wallet);

// Your flash loan contract address that implements IFlashLoanRecipient
const FLASH_LOAN_RECIPIENT = config.payerAccount;

// Specify token address and loan amount
const tokenAddress = config.DAI; // Replace with desired token address (e.g., DAI)
const loanAmount = ethers.parseUnits("10000000", "wei"); // Example: 1000 tokens with 18 decimals

  // Approve Vault to spend tokens on behalf of your contract if needed
  const token = new ethers.Contract(tokenAddress, erc20Abi, wallet);
  const approvalTx = await token.approve(VAULT_ADDRESS, loanAmount);
  await approvalTx.wait();
  console.log("Approval transaction:", approvalTx.hash);

  // Prepare flash loan parameters
  const tokens = [tokenAddress]; // Array of token addresses to borrow
  const amounts = [loanAmount];  // Corresponding loan amounts
  const abiCoder = new ethers.AbiCoder();
  const userData = abiCoder.encode(["string"], [""]); // Optional data payload

  // Execute flash loan
  const flashLoanTx = await vault.flashLoan(
    FLASH_LOAN_RECIPIENT, // Address of contract implementing IFlashLoanRecipient
    tokens,
    amounts,
    userData
    ,{
        maxFeePerGas: ethers.parseUnits("50", "gwei"),        // Maximum total gas fee per unit of gas
        maxPriorityFeePerGas: ethers.parseUnits("1", "gwei"), // Tip for miners
        gasLimit: ethers.parseUnits("2000000", "wei")
      }
  );
  await flashLoanTx.wait();
  console.log("Flash loan transaction:", flashLoanTx.hash);
}

executeFlashLoan()
  .then(() => console.log("Flash loan executed"))
  .catch(error => console.error("Error executing flash loan:", error));
