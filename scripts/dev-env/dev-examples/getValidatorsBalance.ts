
import { ethers } from "hardhat";


async function main() {

    const  validatorsContractAddr = "0x000000000000000000000000000000000000f333" ;
    console.log(`the balance of validators contract is ${ethers.utils.formatEther(await ethers.provider.getBalance(validatorsContractAddr))}`);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
