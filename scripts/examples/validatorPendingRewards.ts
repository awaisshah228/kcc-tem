
import { ethers } from "hardhat";


const toEther = ethers.utils.formatEther;

async function main() {


    const actor = (await ethers.getSigners())[1];
    const factory = await ethers.getContractFactory("Validators",actor);

    const validators = factory.attach("0x000000000000000000000000000000000000f333")

   

    // is actor really an active validator? 
    const activeValidators = await validators.getActiveValidators();
    if (activeValidators.filter((v)=> v == actor.address).length != 1){
        console.error(`${actor.address} is not an active validator`);
        return 
    }


    // The pending fee of the validator 
    console.log(`the pending commision fee of validator is ${toEther(await validators.getPoolpendingFee(actor.address))}`);

    console.log(`Before claiming fees: balance of validator is: ${toEther(await ethers.provider.getBalance(actor.address))}`);


    // the manager of the validator 
    const managerAddr = await validators.getPoolManager(actor.address);

    // only the manager can claim fee rewards 
    const manager = await ethers.getSigner(managerAddr);

    // claim fees 
    const tx = await validators.connect(manager).claimFeeReward(actor.address);
    await tx.wait();

    console.log(`After claiming fees: balance of validator is: ${toEther(await ethers.provider.getBalance(actor.address))}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
