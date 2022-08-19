
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

    const abc = await validators.getUserVotingSummary(actor.address);


    console.log(`Voting summary of use ${actor.address}:`)
    abc.forEach((e,i)=>{
        console.log(`===> ${i}, votes to ${e.validator}`);
        console.log(`total ballots of validator: ${e.validatorBallot}`);
        console.log(`validator commission rate: ${e.feeShares.div(10000).toString()}`)
        console.log(`votes to this validator: ${e.ballot}`);
        console.log(`pending rewards in this validator: ${e.pendingReward} wei`);
        console.log(`revoking votes: ${e.revokingBallot}`);
        console.log(`revoking unlock time(UTC UnixTime): ${e.revokeLockingEndTime}`);
    })
   


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
