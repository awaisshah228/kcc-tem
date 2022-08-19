/* tslint:disable */
/* eslint-disable */

import { expect } from "chai";
import { ethers, network } from "hardhat";
import { ValidatorMockForReservePool } from "../typechain";
import { ReservePool } from "../typechain/ReservePool";



type SignerWithAddress = Awaited<ReturnType<typeof ethers["getSigner"]>>;

// test suite 
describe("ReservePool", function () {

  let reservePool: ReservePool; // the reservePool deployed before each test case
  let validatorMock: ValidatorMockForReservePool; // mocked validator contract
  let deployer: SignerWithAddress; // the deployer signer of the reservePool contract 
  let admin: SignerWithAddress; // the admin of reservePool  
  
  const _6_KCS = ethers.constants.WeiPerEther.mul(6);
  const _5_KCS = ethers.constants.WeiPerEther.mul(5);
  const _1_KCS = ethers.constants.WeiPerEther.mul(1);
  const _BIG_ONE = ethers.constants.One;
  const _BIG_ZERO = ethers.constants.Zero;


  beforeEach(async () => {

    deployer = (await ethers.getSigners())[0];
    admin = (await ethers.getSigners())[1];

    const factory = await ethers.getContractFactory("ReservePool", deployer);
    reservePool = await factory.deploy();

    const mockFactory = await ethers.getContractFactory("ValidatorMockForReservePool", deployer);
    validatorMock = await mockFactory.deploy();

    await validatorMock.setReservePool(reservePool.address);

    await reservePool.initialize(admin.address,
      validatorMock.address,
      ethers.constants.AddressZero, // punish not used 
      ethers.constants.AddressZero, // proposal not used 
      reservePool.address,100 );
  });

  it("initialization", async function () {

    await expect(reservePool.initialize(admin.address,
      validatorMock.address,
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      reservePool.address,100),
      "can only be initialized once")
      .to.be.reverted;

    expect(await reservePool.admin(),
      "admin is the same as initialized")
      .to.equal(admin.address);

    await expect(reservePool.connect(deployer).changeAdmin(validatorMock.address),
      "non admin cannot change admin")
      .to.be.reverted;

    await expect(reservePool.connect(admin).changeAdmin(validatorMock.address),
      "admin can change admin")
      .not.to.be.reverted;
  });


  it("withdrawBlockReward", async function () {

    reservePool = reservePool.connect(deployer);
    await expect(reservePool.withdrawBlockReward(),
      "withdraw can ony be called from validators")
      .to.be.reverted;

    reservePool = reservePool.connect(admin);
    await expect(reservePool.withdrawBlockReward(),
      "withdraw can ony be called from validators")
      .to.be.reverted;


    // set block reward as 5 kcs 
    await reservePool.setBlockRewardAmount(_5_KCS);


    // round 1: no kcs in reservePool 

    expect(await ethers.provider.getBalance(reservePool.address),
        "no kcs in reservePool")
        .to.be.equal(_BIG_ZERO);
    expect(await ethers.provider.getBalance(validatorMock.address),
        "no kcs in validatorsContract")
        .to.be.equal(_BIG_ZERO);

    await expect(validatorMock.withdrawBlockReward())
      .not.to.be.reverted;

    // round 2: 6 kcs in reservePool 
    //          5 will be withdrawn 
    await admin.sendTransaction({
      to: reservePool.address,
      value: _6_KCS,
    });
    expect(await ethers.provider.getBalance(reservePool.address),
        "6 kcs in reservePool")
        .to.be.equal(_6_KCS);  
     
    await validatorMock.withdrawBlockReward()
    expect(await validatorMock.lastWithdrawAmount())
        .to.be.equal(_5_KCS);
        
    expect(await ethers.provider.getBalance(reservePool.address),
        "1 kcs in reservePool")
        .to.be.equal(_1_KCS);  
    
    expect(await ethers.provider.getBalance(validatorMock.address),
        "5 kcs in validatorsContract")
        .to.be.equal(_5_KCS);      
        
    // round 3: 1 kcs in reserve pool 
    //          the only 1 will be withdrawn 
    expect(await ethers.provider.getBalance(reservePool.address),
        "1 kcs in reservePool")
        .to.be.equal(_1_KCS);  
     
    await validatorMock.withdrawBlockReward()
    expect(await validatorMock.lastWithdrawAmount(),
        "only the left 1 kcs can be withdrawn")
        .to.be.equal(_1_KCS);
        
    expect(await ethers.provider.getBalance(reservePool.address),
        "0 kcs in reservePool")
        .to.be.equal(_BIG_ZERO);  
    
    expect(await ethers.provider.getBalance(validatorMock.address),
        "6 kcs in validatorsContract")
        .to.be.equal(_6_KCS);      
         
  
  });

  
  it("state management", async function () {

    // round 1: deployer tries changing state 
    reservePool = reservePool.connect(deployer);
    await expect(reservePool.setState(_BIG_ZERO),
        "state can not be changed by other than admin")
        .to.be.reverted;


    // round 2: admin changes state 
    reservePool = reservePool.connect(admin);
    await expect(reservePool.setState(_BIG_ZERO),
        "state can not be changed by other than admin")
        .not.to.be.reverted;
    expect(await reservePool.state()).to.equal(_BIG_ZERO);


    // as the state is disabled, withdrawal is disabled 

    await admin.sendTransaction({
      to: reservePool.address,
      value: _6_KCS,
    });
    expect(await ethers.provider.getBalance(reservePool.address),
        "6 kcs in reservePool")
        .to.be.equal(_6_KCS);    
    await reservePool.setBlockRewardAmount(_5_KCS);
    expect(await reservePool.blockRewardAmount(),
        "blockRewardAmount is now 5 kcs")
        .to.equal(_5_KCS);  

    // try withdraw 

    await validatorMock.withdrawBlockReward();
    expect(await validatorMock.lastWithdrawAmount(),
      "0 kcs withdrawn")
      .to.be.equal(_BIG_ZERO);
       
  });

  it("blockRewardAmount management", async function () {

    // deployer tries changing blockRewardAmount  
    reservePool = reservePool.connect(deployer);
    await expect(reservePool.setBlockRewardAmount(_BIG_ONE),
        "blockRewardAmount can not be changed by other than admin")
        .to.be.reverted;


    // admin changes  blockRewardAmount
    reservePool = reservePool.connect(admin);
    await expect(reservePool.setBlockRewardAmount(_BIG_ONE),
        "blockReward can not be changed by other than admin")
        .not.to.be.reverted;
    expect(await reservePool.blockRewardAmount(),
        "blockRewardAmount is 1 kcs ").to.equal(_BIG_ONE);


    // is the new blockRewardAmount effective? 

    // setups 
    await admin.sendTransaction({
      to: reservePool.address,
      value: _6_KCS,
    });
    expect(await ethers.provider.getBalance(reservePool.address),
        "6 kcs in reservePool")
        .to.be.equal(_6_KCS);    

    // round 1: blockRewardAmount = 1 kcs 
    await validatorMock.withdrawBlockReward();
    expect(await validatorMock.lastWithdrawAmount(),
      "1 kcs withdrawn")
      .to.be.equal(_BIG_ONE);


    // round 2: blockRewardAmount = 2 kcs 
    await expect(reservePool.setBlockRewardAmount(_BIG_ONE.mul(2)),
        "blockReward can not be changed by other than admin")
        .not.to.be.reverted;
    expect(await reservePool.blockRewardAmount(),
        "blockRewardAmount is 2 kcs ").to.equal(_BIG_ONE.mul(2));   
       
  });
 
   




}); // end of describe 
