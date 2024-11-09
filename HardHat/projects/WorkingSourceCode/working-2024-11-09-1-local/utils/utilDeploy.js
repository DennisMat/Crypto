async function deploy(SolidityContract) {
    const contractFactory =
        await ethers.getContractFactory(SolidityContract)
            .then(contract => contract.deploy({
                maxFeePerGas: ethers.parseUnits("50", "gwei"),        // Maximum total gas fee per unit of gas
                maxPriorityFeePerGas: ethers.parseUnits("1", "gwei"), // Tip for miners
                gasLimit: ethers.parseUnits("2000000", "wei")
            }));

    await contractFactory.waitForDeployment();
    const deployedAddress = await contractFactory.getAddress();
    console.log(SolidityContract + ' deployed to:', deployedAddress);
    return deployedAddress;
}

module.exports = { deploy

}; 