
import { ethers } from "hardhat";


async function main() {


    const rp = (await ethers.getSigners())[0];
    const f = await ethers.getContractFactory("ReservePool", rp);

    const reservePool = f.attach("0x000000000000000000000000000000000000f999")

    const t  = await reservePool.setBlockRewardAmount(0);

    // wait the tx to be included in some block
    await t.wait();

    console.log(`current block reward amout is : ${ethers.utils.formatEther(await reservePool.blockRewardAmount())}`)

    const val = (await ethers.getSigners())[3]; // validator to vote


    const actor = (await ethers.getSigners())[0];
    const factory = await ethers.getContractFactory("Validators", actor);

    const validators = factory.attach("0x000000000000000000000000000000000000f333")

    const pendingRewards = await validators.pendingReward(val.address, actor.address)
    const h = await ethers.provider.getBlockNumber()
    const beforeClaimBalance = await actor.getBalance(h)
    console.log(`The pending reward of ${actor.address} from validator ${val.address} is ${ethers.utils.formatEther(pendingRewards)}, at ${h}`);
    console.log(`nonformat The pending reward of ${actor.address} from validator ${val.address} is ${pendingRewards}, at ${h}`);

    const tx = await validators.connect(actor).claimReward(val.address)
    const receipt = await tx.wait(1);

    const balance = await actor.getBalance(receipt.blockNumber)

    console.log(`tx gasUsed: ${ethers.utils.formatEther(receipt.gasUsed.mul(tx.gasPrice||0))}`)
    console.log(`nonformat tx gasUsed: ${receipt.gasUsed.mul(tx.gasPrice||0)}`)
    console.log(`before claim, balance of ${actor.address} is ${ethers.utils.formatEther(beforeClaimBalance)}, at ${h}`)
    console.log(` nonformat before claim, balance of ${actor.address} is ${beforeClaimBalance}, at ${h}`)
    console.log(` after claim, balance of ${actor.address} is ${ethers.utils.formatEther(balance)}, at ${receipt.blockNumber}`)
    console.log(` nonformat after claim, balance of ${actor.address} is ${balance}, at ${receipt.blockNumber}`)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
