
import { ethers } from "hardhat";



async function main() {


    const actor = (await ethers.getSigners())[0];
    const factory = await ethers.getContractFactory("ReservePool",actor);

    const reservePool = factory.attach("0x000000000000000000000000000000000000f999")

    const tx  = await reservePool.setBlockRewardAmount(ethers.constants.WeiPerEther.div(10000));

    // wait the tx to be included in some block 
    await tx.wait();

    console.log(`current block reward amout is : ${ethers.utils.formatEther(await reservePool.blockRewardAmount())}`)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
