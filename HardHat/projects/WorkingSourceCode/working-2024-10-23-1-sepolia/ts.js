async function main() {
    const config = require("./config.sepolia.json")
    console.log("Loaded config...");
    const util= require("./util.js");

    const deployedContractAddress = "0xfe0D1d4caC84DA168260853e6F34a236715f75ac";


}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });    