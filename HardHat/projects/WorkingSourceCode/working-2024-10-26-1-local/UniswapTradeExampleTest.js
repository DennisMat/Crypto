

// from https://stackoverflow.com/questions/70846489/deploying-uniswap-v2-sushiswap-or-similar-in-brownie-hardhat-or-truffle-test
// https://ethereum.stackexchange.com/questions/104030/testing-token-with-uniswap-liquidity-provisioning-using-hardhat



async function main() {
    const { expect, assert } = require("chai");
    const ERC20ABI = require('./ERC20.json');

    const UNISWAPV2ROUTER02_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const DAI_ADDRESS = "0x6b175474e89094c44da98b954eedeac495271d0f";


    const provider = ethers.provider;
    const [owner, addr1] = await ethers.getSigners();
    //addr1 turns out to be 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
    console.log("addr1 " + addr1.address);

    const DAI = new ethers.Contract(DAI_ADDRESS, ERC20ABI, provider);

    // Assert addr1 has 1000 ETH to start
    let addr1Balance = await provider.getBalance(addr1.address);


    //expectedBalance = ethers.BigNumber.from("10000000000000000000000");
    let expectedBalance = ethers.parseEther("10000.0");
    //console.log("expectedBalance "  + addr1Balance);
    //console.log("expectedBalance "  + expectedBalance);
   // assert(addr1Balance == expectedBalance);

    // Assert addr1 DAI balance is 0
    let addr1Dai = await DAI.balanceOf(addr1.address);
    //assert(addr1Dai == 0);
    console.log('Before:' + addr1Dai);


    //const TokenSwap = await ethers.getContractFactory('TokenSwap');

//   console.log('Deploying TokenSwap...');
//   const e = await TokenSwap.deploy();
//   await e.waitForDeployment();
//   console.log('Box deployed to:', await e.getAddress());

 
    const uniswapTradeExample =
        await ethers.getContractFactory("UniswapTradeExample")
            .then(contract => contract.deploy(UNISWAPV2ROUTER02_ADDRESS,{//UNISWAPV2ROUTER02_ADDRESS is the constructor
                maxFeePerGas: ethers.parseUnits("50", "gwei"),        // Maximum total gas fee per unit of gas
                maxPriorityFeePerGas: ethers.parseUnits("1", "gwei"), // Tip for miners
                gasLimit: ethers.parseUnits("2000000", "wei")
              }));
    //await uniswapTradeExample.deployed();

    await uniswapTradeExample.waitForDeployment();
    console.log('uniswapTradeExample deployed to:', await uniswapTradeExample.getAddress());

    // Swap 1 ETH for DAI
    await uniswapTradeExample.connect(addr1).swapExactETHForTokens(
        0,
        DAI_ADDRESS,
        { value: ethers.parseUnits("1","ether") }
    );

    // Assert addr1Balance contains one less ETH
    expectedBalance = addr1Balance-ethers.parseUnits("1","ether");
    addr1Balance = await provider.getBalance(addr1.address);
   // assert(addr1Balance.lt(expectedBalance));
   assert(addr1Balance<expectedBalance);

    // console.log("expectedBalance "  + expectedBalance);
    // console.log("addr1Balance "  + addr1Balance);

    // Assert DAI balance increased
    addr1Dai = await DAI.balanceOf(addr1.address);
    //assert(addr1Dai.gt(ethers.BigNumber.from("0")));
    assert(addr1Dai>ethers.parseUnits("0","ether"));
    console.log('After :' + addr1Dai);


}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
