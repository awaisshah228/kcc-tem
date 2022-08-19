
import { ethers } from "hardhat";

// Two votes to the first active validator. 
async function main() {

    const actor = (await ethers.getSigners())[0];
    const factory = await ethers.getContractFactory("Validators",actor);

    const validators = factory.attach("0x000000000000000000000000000000000000f333");

    console.log("current active validators:");
    (await validators.getActiveValidators()).forEach((v)=>{
      console.log(v);
    })


    const val = (await validators.getActiveValidators())[0];

    console.log(`We are voting to ${val}`);
    
    console.log(`Before Vote: The ballots of validator ${val} is ${await validators.getPoolsuppliedBallot(val)}`)

    const tx = await validators.vote(val,{
        value: ethers.constants.WeiPerEther.mul(2),
    })

    // wait for the transaction to be included in some block
    await tx.wait(1);

    console.log(`After Vote: The ballots of validator ${val} is ${await validators.getPoolsuppliedBallot(val)}`)


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
