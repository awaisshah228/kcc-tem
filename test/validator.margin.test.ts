/* tslint:disable */
/* eslint-disable */


import {ProposalMockForValidators, ReservePoolMockForValidators, Validators} from "../typechain";
import {ethers} from "hardhat";
import {getLastBlockInfo, mineBlocks, setBalance, setCoinbase} from "./helpers";
import {BigNumber, utils} from "ethers";
import {expect} from "chai";
import { contains } from "underscore";
import { time } from "console";

type SignerWithAddress = Awaited<ReturnType<typeof ethers["getSigner"]>>;


describe("valdiators: deposit & redeem margin, claim fees", function (){

    // the validators contract
    let validatorContract: Validators;
    let proposalMock: ProposalMockForValidators;
    let reservePoolMock:ReservePoolMockForValidators;
    let deployer: SignerWithAddress;
    let admin: SignerWithAddress;
    let manager: SignerWithAddress;
    let initialValidators: SignerWithAddress[];
    let candidates: SignerWithAddress[]; // candidates for validators
    let candidateA: SignerWithAddress; // candidates for validators
    let voterA : SignerWithAddress, voterB:SignerWithAddress;
    let p1: string;


    // constants
    const INITIAL_FEE_SHARE = 2000; // initial commission fee rate for validator
    const MIN_SELF_BALLOTS_IN_KCS = ethers.constants.WeiPerEther.mul(10000); // minimum Self Ballots denominated in KCS
    const MIN_SELF_BALLOTS = BigNumber.from(10000); // minimum Self Ballots denominated in KCS
    const MARGIN_LOCKING_DURATION = BigNumber.from(15 * 24 * 60 * 60); // 15 days
    const epoch = 1; 

    beforeEach(async () => {

        const signers = await ethers.getSigners();
        let others: SignerWithAddress[];
        [deployer, admin, manager, voterA,voterB, ...others] = signers;

        validatorContract = await (await ethers.getContractFactory("Validators", deployer)).deploy();
        proposalMock = await (await ethers.getContractFactory("ProposalMockForValidators", deployer)).deploy();
        reservePoolMock = await (await ethers.getContractFactory("ReservePoolMockForValidators",deployer)).deploy();

        initialValidators = others.slice(0, 7); // the first 7 candidate as the init validators

        candidates = others.slice(7);

        // initial KCS in contract
        await setBalance(validatorContract.address, MIN_SELF_BALLOTS_IN_KCS.mul(initialValidators.length));
        // initial KCS in reservePool 
        await setBalance(reservePoolMock.address,MIN_SELF_BALLOTS_IN_KCS);

        // some candidate
        [candidateA] = candidates;

        // construct a proposal for candidateA
        p1 = ethers.utils.hexZeroPad("0x1111", 32);
        await proposalMock.setPassed(candidateA.address, p1);

        // initialize for the first time
        await validatorContract.initialize(
            initialValidators.map(v => v.address),
            initialValidators.map(v => v.address),
            initialValidators.map(v => 2000), // 20% feeShare
            admin.address,
            validatorContract.address,
            ethers.constants.AddressZero,
            proposalMock.address,
            reservePoolMock.address,epoch);
    });

    it("deposit margin: single deposit", async function () {


        // Add a pool for candidateA
        validatorContract = validatorContract.connect(candidateA);
        await validatorContract.addValidator(
            candidateA.address,
            manager.address,
            p1,
            INITIAL_FEE_SHARE,
            "candidateA",
            "candidateA's website",
            "candidateA's email");

        expect(await validatorContract.getTopValidators(),
            "candidateA is not one of the top validators yet")
            .not.to.contains(candidateA.address);

        const ballots = 10000;
        await validatorContract.connect(manager).depositMargin(
            candidateA.address,
            {
                value: ethers.constants.WeiPerEther.mul(ballots) // 10000 KCS
            });

        expect(await validatorContract.getPoolSelfBallots(candidateA.address)).to.equal(ballots);
        expect(await validatorContract.getTopValidators(),
            "candidateA should be one of the top validators")
            .to.contains(candidateA.address);
    });

    it("can only deposit integer multiples of 1 KCS", async function () {
        let origin = await ethers.provider.getBalance(manager.address);
        // Add a pool for candidateA
        validatorContract = validatorContract.connect(candidateA);
        await validatorContract.addValidator(
            candidateA.address,
            manager.address,
            p1,
            INITIAL_FEE_SHARE,
            "candidateA",
            "candidateA's website",
            "candidateA's email");

        await expect(validatorContract.connect(manager).depositMargin(
            candidateA.address,
            {
                value: BigNumber.from(100005).mul(ethers.constants.WeiPerEther).div(10) // 10000.5 KCS
            })).
            to.be.reverted;
    });

    it("mutliple deposits", async function () {

        // Add a pool for candidateA
        validatorContract = validatorContract.connect(candidateA);
        await validatorContract.addValidator(
            candidateA.address,
            manager.address,
            p1,
            INITIAL_FEE_SHARE,
            "candidateA",
            "candidateA's website",
            "candidateA's email");

        expect(await validatorContract.getTopValidators(),
            "candidateA is not one of the top validators yet")
            .not.to.contains(candidateA.address);

        // deposit first half 
        await validatorContract.connect(manager).depositMargin(
            candidateA.address,
            {
                value: MIN_SELF_BALLOTS_IN_KCS.div(2) // half 
            });


        expect(await validatorContract.getTopValidators(),
            "candidateA is not one of the top validators yet")
            .not.to.contains(candidateA.address);
        

        expect(await validatorContract.getPoolSelfBallots(candidateA.address)).to.equal(MIN_SELF_BALLOTS.div(2));


        expect(await validatorContract.getTopValidators(),
            "candidateA is not one of the top validators yet")
            .not.to.contains(candidateA.address);
        

        // deposit the other half 
        await validatorContract.connect(manager).depositMargin(
            candidateA.address,
            {
                value: MIN_SELF_BALLOTS_IN_KCS.div(2) // another half
            });
        
        expect(await validatorContract.getPoolSelfBallots(candidateA.address)).to.equal(MIN_SELF_BALLOTS);
        expect(await validatorContract.getTopValidators(),
            "candidateA should be one of the top validators")
            .to.contains(candidateA.address);        

    });


    it("claim validator's ballot rewards & fee rewards", async function(){

        // we have 7 initial validators 
        // each with Ballots of MIN_SELF_BALLOTS
        // each with feeShares of 20% 

        const [someValidator] = initialValidators;
        
        // blockReward: 7 KCS per block 
        const blockReward = ethers.constants.WeiPerEther.mul(7);
        await reservePoolMock.setBlockReward(blockReward); 

        await setCoinbase(admin.address);
        await validatorContract.connect(admin).distributeBlockReward();


        // ballots in each pool 
        const selfBallotPerPool = MIN_SELF_BALLOTS;
        // rewards distributed to each Ballot
        const rewardsPerBallot = blockReward.div(selfBallotPerPool.mul(initialValidators.length));
        // rewards per pool 
        const rewardsPerPool = rewardsPerBallot.mul(selfBallotPerPool);
        // fee reward per pool 
        const feeRewardPerPool = rewardsPerPool.mul(INITIAL_FEE_SHARE).div(10000);
        // ballotRewards per pool 
        const ballotReward = rewardsPerPool.sub(feeRewardPerPool);

        expect(await validatorContract.getPoolpendingFee(someValidator.address),
            "check pending fees")
            .to.be.equal(feeRewardPerPool);

        // claim fee rewards 
        let balanceBefore = await someValidator.getBalance("latest");
        await validatorContract.connect(someValidator).claimFeeReward(someValidator.address,{
            gasPrice: 0, // use zero gas price 
        })
        let balanceAfter = await someValidator.getBalance("latest");
        expect(balanceAfter.sub(balanceBefore),
            "check the claimed fee rewards")
            .to.be.equal(feeRewardPerPool);


        // claim ballot rewards 
        balanceBefore = await someValidator.getBalance("latest");
        await validatorContract.connect(someValidator).claimSelfBallotsReward(someValidator.address,{
            gasPrice: 0, // use zero gas price 
        })
        balanceAfter = await someValidator.getBalance("latest");
        expect(balanceAfter.sub(balanceBefore),
            "check the claimed selfBallots rewards")
            .to.be.equal(ballotReward);


    })


    it("only managers of validators can claim feeRewards & ballot rewards & deposit & redeem & withdraw", async function(){

        // Add a pool for candidateA
        // But the manager is not candiateA, it is candidateB
        validatorContract = validatorContract.connect(candidateA);
        await validatorContract.addValidator(
            candidateA.address,
            manager.address,
            p1,
            INITIAL_FEE_SHARE,
            "candidateA",
            "candidateA's website",
            "candidateA's email",{
                value: MIN_SELF_BALLOTS_IN_KCS,
            });

        // update new added validtor to active validators 
        const activeValidtorSet = await validatorContract.getTopValidators();
        expect(activeValidtorSet).include(candidateA.address);
        

        await setCoinbase(admin.address);

        // epoch == 1 
        await validatorContract.connect(admin).updateActiveValidatorSet(activeValidtorSet);
        
        // ditribute block rewards 
        const blockReward = ethers.constants.WeiPerEther.mul(7);
        await reservePoolMock.setBlockReward(blockReward); 
        await validatorContract.connect(admin).distributeBlockReward();     

        expect(await validatorContract.connect(admin).getPoolpendingFee(candidateA.address))
            .not.equal(ethers.constants.Zero);
        
        
        // validator cannot claim fee rewards 
        await expect(validatorContract.connect(candidateA).claimFeeReward(candidateA.address),
            "only manager can claim fee rewards")
            .to.be.reverted;

        // validator cannot claim ballot rewards
        await expect(validatorContract.connect(candidateA).claimSelfBallotsReward(candidateA.address),
            "only manager can claim Ballot rewards")
            .to.be.reverted; 

        // validator cannot deposit margin 
        await expect(validatorContract.connect(candidateA).depositMargin(candidateA.address,{
            value: MIN_SELF_BALLOTS_IN_KCS,
        }),"only manager can deposit margin")
        .to.be.reverted;

        // validator cannot redeem margin 
        await expect(validatorContract.connect(candidateA).redeemMargin(candidateA.address,MIN_SELF_BALLOTS),
            "only manager can deposit margin")
            .to.be.reverted;        


            
        // manager is allowed to claim rewards
        await validatorContract.connect(manager).claimFeeReward(candidateA.address);
        await validatorContract.connect(manager).claimSelfBallotsReward(candidateA.address);
        await validatorContract.connect(manager).depositMargin(candidateA.address,{
            value: MIN_SELF_BALLOTS_IN_KCS,
        })
        await validatorContract.connect(manager).redeemMargin(candidateA.address,MIN_SELF_BALLOTS);

    });


    it("redeem & withdraw margin",async function(){

        // 7 initial active validator
        // each with margin of MIN_SELF_BALLOTS_IN_KCS 

        const [someValidator] = initialValidators;

        expect(await validatorContract.getPoolSelfBallots(someValidator.address))
            .to.equal(MIN_SELF_BALLOTS);

        // check revokingInfo before redeeming 
        let [pendingBallots,lockingEndTime] = await validatorContract.revokingInfo(someValidator.address,someValidator.address);
        expect([pendingBallots,lockingEndTime]).to.be.deep.equal(
            [ethers.constants.Zero,ethers.constants.Zero]
        )

        // redeem half of the margin 
        await validatorContract.connect(someValidator).redeemMargin(someValidator.address,MIN_SELF_BALLOTS.div(2));


        const {timestamp} = await getLastBlockInfo();

        // check revokingInfo after redeeming 
        [pendingBallots,lockingEndTime] = await validatorContract.revokingInfo(someValidator.address,someValidator.address);
        expect([pendingBallots,lockingEndTime]).to.be.deep.equal(
            [
                MIN_SELF_BALLOTS.div(2), // redeemed amount 
                MARGIN_LOCKING_DURATION.add(timestamp)
            ]
        )

        // you cannot withdraw now 
        let balanceBefore = await someValidator.getBalance();
        await validatorContract.connect(someValidator).withdrawMargin(someValidator.address,
            {
                gasPrice:0
            });
        let balanceAfter = await someValidator.getBalance();
        expect(balanceAfter.sub(balanceBefore),
            "no margin can be withdrawn at present")
            .to.be.equal(ethers.constants.Zero);

        // wait for 3 days; 
        // block interval is 3 seconds 
        await mineBlocks(3 * 24 *60 * 60 / 3);

        // still cannot withdraw 
        balanceBefore = await someValidator.getBalance();
        await validatorContract.connect(someValidator).withdrawMargin(someValidator.address,
            {
                gasPrice:0
            });
        balanceAfter = await someValidator.getBalance();
        expect(balanceAfter.sub(balanceBefore),
            "no margin can be withdrawn at present after only 3 days")
            .to.be.equal(ethers.constants.Zero);
            
        // wait for another 15 days;
        // block interval is 3 seconds 
        await mineBlocks(15 * 24 *60 * 60 / 3);
        
        // and this time, it works 
        balanceBefore = await someValidator.getBalance();
        await validatorContract.connect(someValidator).withdrawMargin(someValidator.address,{
            gasPrice:0
        });
        balanceAfter = await someValidator.getBalance();
        expect(balanceAfter.sub(balanceBefore),
            "no margin can be withdrawn at present after only 15 days")
            .to.be.equal(MIN_SELF_BALLOTS_IN_KCS.div(2));


    });


    it("order change in top validators when deposit & redeem",async function(){
        
        // Get the list of top Validators from fixture
        let topValidators = await validatorContract.getTopValidators();


        // Voter B vote 10 for each validator 
        for(let i =0; i< topValidators.length; ++i){
            await validatorContract.connect(voterB).vote(topValidators[i],
                {
                    value: utils.parseEther("20"),
                }
            )
        }

        // The order may change 
        topValidators = await validatorContract.getTopValidators();

        // Get the previous last validator 
        const preLastVal = topValidators[topValidators.length - 1];

        await validatorContract.connect(voterA).vote(preLastVal,{
            value: utils.parseEther("20"), // vote 20 for preLastVal
        });

        topValidators = await validatorContract.getTopValidators();

        expect(
            preLastVal,
            "The last one is now the first"
        ).eq(
            topValidators[0]
        )        
        
        const firstVal = preLastVal;

        // voteA revokes 20 KCS  
        await validatorContract.connect(voterA).revokeVote(firstVal,20);
        // voterB revokes 10 KCS
        await validatorContract.connect(voterB).revokeVote(firstVal,10);

        topValidators = await validatorContract.getTopValidators();

        expect(
            firstVal,
            "The fist one is now the last"
        ).eq(
            topValidators[topValidators.length - 1]
        )  
    });


});

