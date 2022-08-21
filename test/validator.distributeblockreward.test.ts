/* tslint:disable */
/* eslint-disable */

import { Validators,ReservePoolMockForValidators,CallDistributeBlockRewardMultipleTimes } from "../typechain";
import { expect } from "chai";
import { ethers } from "hardhat";
import { setBalance, setCoinbase } from "./helpers";

type SignerWithAddress = Awaited<ReturnType<typeof ethers["getSigner"]>>;


describe("validators: distributeBlockReward", function () {


    // the validators contract 
    let validatorContract: Validators;
    let reservePoolMock : ReservePoolMockForValidators;
    let multiCall: CallDistributeBlockRewardMultipleTimes;
    let deployer: SignerWithAddress;
    let admin: SignerWithAddress;
    let initialValidators: SignerWithAddress[];

    // constants 
    const REDEEM_LOCK_DURATION = 3 * 24 * 60 * 60; // 3 days 
    const FEE_SET_LOCKING_DURATION = 1 * 24 * 60 * 60; // 1 day 
    const INITIAL_FEE_SHARE = 2000; // initial commission fee rate for validator 
    const MIN_SELF_BALLOTS_IN_KCS = ethers.constants.WeiPerEther.mul(10000); // minimum Self Ballots denominated in KCS 
    const MIN_SELF_BALLOTS = MIN_SELF_BALLOTS_IN_KCS.div(ethers.constants.WeiPerEther);

    beforeEach(async () => {

        const signers = await ethers.getSigners();
        let others: SignerWithAddress[];
        [deployer, admin, ...others] = signers;

        validatorContract = await (await ethers.getContractFactory("Validators", deployer)).deploy()
        reservePoolMock = await (await ethers.getContractFactory("ReservePoolMockForValidators", deployer)).deploy()
        multiCall = await (await ethers.getContractFactory("CallDistributeBlockRewardMultipleTimes", deployer)).deploy(validatorContract.address);

        initialValidators = others.slice(0, 7); // the first 7 candidate as the init validators

        // initial KCS in contract 
        await setBalance(validatorContract.address,MIN_SELF_BALLOTS_IN_KCS.mul(initialValidators.length));
        

        // initialize for the first time 
        await validatorContract.initialize(
            initialValidators.map(v => v.address),
            initialValidators.map(v => v.address),
            initialValidators.map(v => 2000), // 20% feeShare
            admin.address,
            validatorContract.address,
            ethers.constants.AddressZero,
            ethers.constants.AddressZero,
            reservePoolMock.address,100);
        
        // send some kscs to reservePoolMock
        await deployer.sendTransaction({
            to: reservePoolMock.address,
            value: ethers.constants.WeiPerEther.mul(10000)
        })


    });


    it("can only be called by the miner",async function(){

        // deployer is the miner
        setCoinbase(admin.address);

        await expect(validatorContract.connect(deployer).distributeBlockReward(),
            "deployer is not the miner, he cannot call distributeBlockReward")
            .to.be.reverted;
        
        await expect(validatorContract.connect(admin).distributeBlockReward(),
            "admin can call distributeBlockReward")
            .not.to.be.reverted;

    });

    it("can only be called once in a block",async function(){

        setCoinbase(multiCall.address); 

        await expect(multiCall.distributeBlockRewardMulti(1),
            "it is okay to call distributeBlockReward only once in a block")
            .not.to.be.reverted;

        await expect(multiCall.distributeBlockRewardMulti(2),
            "it is not allowed to call distributeBlockReward twice in a block")
            .to.be.reverted;

    });    



    it("5 kcs distributed to 7 initial validators",async function(){

        // reservePool setup 
        // block reward is 5 kcs 
        const blockReward = ethers.constants.WeiPerEther.mul(5);
        await reservePoolMock.setBlockReward(blockReward);
        await setCoinbase(deployer.address);
        

        // number of active validators 
        // block reward will be distributed to these validators 
        const numOfActiveValidators = initialValidators.length;


        await validatorContract.distributeBlockReward();

        // the seltBallots of each validator 
        const selfBallotsPerPool = MIN_SELF_BALLOTS;

        for(let i =0; i < numOfActiveValidators; ++i){
            const val = initialValidators[i].address;
            expect(await validatorContract.getPoolSelfBallots(val))
                .to.be.equals(selfBallotsPerPool);
            expect(await validatorContract.getPoolsuppliedBallot(val))
                .to.be.equal(selfBallotsPerPool)
        }
        
        // we have 7 pools with the same ballots 

        const totalBallots = selfBallotsPerPool.mul(numOfActiveValidators);
        // rewards distributed to each ballot
        const rewardPerBallot = blockReward.div(totalBallots);
        // rewards per pool 
        const rewardsPerPool = rewardPerBallot.mul(selfBallotsPerPool);
        // the commission fee paid to pool's validator 
        const feeRewardPerPool = rewardsPerPool.mul(INITIAL_FEE_SHARE).div(10000);
        console.log("block reward",blockReward.toString())
        console.log("fee Reward",(feeRewardPerPool).toString())
        // the accRewardPershare of each pool 
        const accRewardPerSharePerPool = rewardsPerPool.sub(feeRewardPerPool).mul(1e12).div(MIN_SELF_BALLOTS);
        // console.log(accRewardPerSharePerPool)
       console.log("accure",(accRewardPerSharePerPool).toString()) 


        for(let i =0; i < numOfActiveValidators; ++i){
            const val = initialValidators[i].address;

            expect(await validatorContract.getPoolpendingFee(val),
                "check pending commission fee of each pool")
                .to.be.equal(feeRewardPerPool);

            expect(await validatorContract.getPoolaccRewardPerShare(val),
                "check accRewardPerShare of each pool ")
                .to.be.equal(accRewardPerSharePerPool);

        }

        // the roundoff error in distributing to each pool will
        // be accummulated to rewardsLeft 

        const rewardsLeft = blockReward.sub(rewardsPerPool.mul(numOfActiveValidators));
                

        expect(await validatorContract.rewardsLeft(),
            "check rewardLeft (roundoff error accumulated)")
            .to.be.equal(rewardsLeft);
        
        

    });


});