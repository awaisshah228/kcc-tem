
import { ethers } from "hardhat";


async function main() {


    const voter = (await ethers.getSigners())[0];
    const factory = await ethers.getContractFactory("Validators", voter);

    const validators = factory.attach("0x000000000000000000000000000000000000f333")

    // The first active validator 
    const val = (await validators.getActiveValidators())[0];

    const pendingRewards = await validators.pendingReward(val, voter.address)
    const h = await ethers.provider.getBlockNumber()
    const beforeClaimBalance = await voter.getBalance(h)
    console.log(`The pending reward of ${voter.address} from validator ${val} is ${ethers.utils.formatEther(pendingRewards)}, at ${h}`);
    console.log(`The pending reward of ${voter.address} from validator ${val} is ${pendingRewards}, at ${h}`);

    const tx = await validators.connect(voter).claimReward(val)
    const receipt = await tx.wait(1);

    const balance = await voter.getBalance(receipt.blockNumber)

    console.log(`tx gasUsed: ${ethers.utils.formatEther(receipt.gasUsed.mul(tx.gasPrice||0))}`)
    console.log(`tx gasUsed: ${receipt.gasUsed.mul(tx.gasPrice||0)}`)
    console.log(`before claim, balance of ${voter.address} is ${ethers.utils.formatEther(beforeClaimBalance)} ether, at ${h}`)
    console.log(`before claim, balance of ${voter.address} is ${beforeClaimBalance} wei, at ${h}`)
    console.log(`after claim, balance of ${voter.address} is ${ethers.utils.formatEther(balance)} ether, at ${receipt.blockNumber}`)
    console.log(`after claim, balance of ${voter.address} is ${balance} wei, at ${receipt.blockNumber}`)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
