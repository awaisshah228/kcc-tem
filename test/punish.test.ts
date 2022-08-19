import { expect } from "chai";
import { ethers } from "hardhat";
import { ValidatorMockForPunish, Punish, CallPunishMultipleTimes } from "../typechain";
import { mineBlocks, setCoinbase } from "./helpers";
import type { ContractReceipt } from "ethers";
import { CallPunishEvent } from "../typechain/ValidatorMockForPunish"


type SignerWithAddress = Awaited<ReturnType<typeof ethers["getSigner"]>>;


// A helper function to extract the first CallPunishEvent of ValidatorMockForPunish from receipt.
// If there is no CallPunishEvent in the receipt, "undefined" will be returned
function getCallPunishEvent(validatorsMock: ValidatorMockForPunish, receipt: ContractReceipt) {

  if (receipt.events != null) {
    for (let i = 0; i < receipt.events.length; i++) {
      const callPunishTopic = validatorsMock.interface.getEventTopic("CallPunish");
      const e = receipt.events[i];
      if (e.topics[0] == callPunishTopic) {
        const { validator, remove } = validatorsMock.interface.decodeEventLog("CallPunish", e.data, e.topics) as unknown as CallPunishEvent["args"];
        return {
          validator, remove
        };
      }
    }
  }

  return undefined;

}



// test suite 
describe("punish contract", function () {

  let punish: Punish; // The punish contract instance 
  let punishMulti: CallPunishMultipleTimes; // the helper contract for punish 
  let validatorMock: ValidatorMockForPunish; // mocked validator contract
  let deployer: SignerWithAddress; // the deployer 
  let admin: SignerWithAddress; // the admin  
  let someone: SignerWithAddress; // someone's address 
  let other: SignerWithAddress; // someone's address

  const epoch = 100;


  beforeEach(async () => {


    const signers = (await ethers.getSigners());

    deployer = signers[0];
    admin = signers[1];
    someone = signers[2];
    other = signers[3];

    const factory = await ethers.getContractFactory("Punish", deployer);
    punish = await factory.deploy();

    const mockFactory = await ethers.getContractFactory("ValidatorMockForPunish", deployer);
    validatorMock = await mockFactory.deploy();

    const multiFactory = await ethers.getContractFactory("CallPunishMultipleTimes", deployer);
    punishMulti = await multiFactory.deploy(punish.address);


    await punish.initialize(
      validatorMock.address,
      punish.address,
      ethers.constants.AddressZero, // proposal not used 
      ethers.constants.AddressZero,  // reservePool not used 
      admin.address,
      epoch);
  });


  it("initialization", async function () {

    await expect(punish.initialize(
      validatorMock.address,
      punish.address,
      ethers.constants.AddressZero, // proposal not used 
      ethers.constants.AddressZero,  // reservePool not used 
      admin.address,
      epoch),
      "can only be initialized once")
      .to.be.reverted;

    expect(await punish.admin(),
      "admin is the same as initialized")
      .to.equal(admin.address);

    await expect(punish.connect(deployer).changeAdmin(validatorMock.address),
      "non admin cannot change admin")
      .to.be.reverted;

    await punish.connect(admin).changeAdmin(deployer.address);
    expect(await punish.admin(),
      "admin has changed")
      .to.equal(deployer.address);
  });


  it("punish can only be called once per block by the miner", async function () {

    // check modifiers 

    // deployer as the miner of the next block 
    await setCoinbase(deployer.address);

    punish = punish.connect(admin);
    await expect(punish.punish(someone.address),
      "punish can not be called by someone other than the miner")
      .to.be.reverted;

    punish = punish.connect(deployer);
    await expect(punish.punish(someone.address),
      "punish can be called by miner")
      .not.to.be.reverted;


    // can only be called once per block 

    await setCoinbase(punishMulti.address);

    await expect(punishMulti.punishMultipleTimes(someone.address, 1),
      "punish can be called once in a block")
      .not.to.be.reverted;


    await expect(punishMulti.punishMultipleTimes(someone.address, 2),
      "punish cannot be called twice in a block")
      .to.be.reverted;

  });

  it("punishment counts", async function () {

    // deployer as the miner of the next block 
    await setCoinbase(deployer.address);

    punish = punish.connect(deployer);

    // threshold to fine the validator  
    const punishThresh = (await punish.punishThreshold()).toNumber();
    // threshold to remove the validator 
    const removeThresh = (await punish.removeThreshold()).toNumber();


    let punishCounts = 0;

    // punish less than punishThresh(24) times 
    // the validator will not be fined 
    for (let i = 1; i < punishThresh; i++) {
      const receipt = await (await punish.punish(someone.address)).wait();
      punishCounts++;

      expect(getCallPunishEvent(validatorMock, receipt),
        "should not call validator's punish function, if punished less than punishThresh times ")
        .to.be.undefined;

      expect(await punish.getPunishRecord(someone.address),
        "check the count of punishment")
        .to.be.equal(punishCounts);
    }

    // punish the punishThresh(24) th time 
    // the validator will be fined 
    let receipt = await (await punish.punish(someone.address)).wait();
    punishCounts++;
    expect(getCallPunishEvent(validatorMock, receipt),
      "validator contract's punish is called with remove == false")
      .to.deep.eq(
        {
          validator: someone.address,
          remove: false,
        }
      );
    expect(await punish.getPunishRecord(someone.address),
      "check the count of punishment")
      .to.be.equal(punishThresh);


    // punish more than punishThresh times but less than removeThresh 
    // the validator will not be fined or removed 
    for (let i = punishCounts + 1; i < removeThresh; i++) {
      const receipt = await (await punish.punish(someone.address)).wait();
      punishCounts++;

      expect(getCallPunishEvent(validatorMock, receipt),
        "validator's punish is not called if punishCounts > punishThresh && punishCounts < removeThresh")
        .to.be.undefined;

      expect(await punish.getPunishRecord(someone.address),
        "check the count of punishment")
        .to.be.equal(punishCounts);
    }

    // punish for the removeThresh th time 
    // the validator will be removed 
    receipt = await (await punish.punish(someone.address)).wait();
    punishCounts++;
    expect(getCallPunishEvent(validatorMock, receipt),
      "validator contract's punish is called with remove == true")
      .to.deep.eq(
        {
          validator: someone.address,
          remove: true, // removed 
        }
      );


    expect(await punish.getPunishRecord(someone.address),
      "punish record will be reset to zero after removing")
      .to.be.equal(0);

  });

  it("decrease missed Blocks counter at the first block of each epoch", async function () {

    // deployer as the miner of the next block 
    await setCoinbase(deployer.address);
    punish = punish.connect(deployer);

    const removeThreshold = (await punish.removeThreshold()).toNumber();

    // punish 1 less than remove threshold 
    let punishCount = removeThreshold - 1;
    for (let i = 1; i <= punishCount; i++) {
      await punish.punish(someone.address);
    }
    expect(await punish.getPunishRecord(someone.address))
      .to.be.equal(punishCount);

    // block N = the last block of last epoch 
    // wait for block N 
    let currBlockNumber = await ethers.provider.getBlockNumber();
    if ((currBlockNumber + 1) % epoch != 0) {
      await mineBlocks(epoch - currBlockNumber % epoch - 1);
    }


    // threshold to fine the validator  
    const punishThresh = (await punish.punishThreshold()).toNumber();
    // threshold to remove the validator 
    const removeThresh = (await punish.removeThreshold()).toNumber();
    // decrease rate 
    const decreaseRate = Math.floor(removeThresh/punishThresh);

    // call decreaseMissedBlocksCounter at the first block of an epoch
    await punish.decreaseMissedBlocksCounter();
    punishCount -= decreaseRate;
    expect(await punish.getPunishRecord(someone.address),
        "missedBlocksCounter should decrease by decreaseRate")
        .to.equal(punishCount);

    await expect(punish.decreaseMissedBlocksCounter(),
        "decreaseMissedBlocksCounter can only be called at the first block of an epoch")
        .to.be.reverted;

  });

  it('clean punish records', async function () {
    // deployer as the miner of the next block
    await setCoinbase(deployer.address);
    punish = punish.connect(deployer);

    const removeThreshold = (await punish.removeThreshold()).toNumber();

    // punish 1 less than remove threshold
    let punishCount = removeThreshold - 1;
    for (let i = 1; i <= punishCount; i++) {
      await punish.punish(someone.address);
    }
    await punish.punish(other.address);

    expect(await punish.getPunishRecord(someone.address)).to.be.equal(punishCount);

    expect((await punish.getPunishValidatorsLen())).to.be.equal(2);

    await punish.punish(someone.address);

    expect((await punish.getPunishValidatorsLen())).to.be.equal(1);

  });


}); // end of describe 
