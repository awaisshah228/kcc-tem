/* tslint:disable */
/* eslint-disable */


import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {ReservePoolMockForValidators, Validators} from "../typechain";
import {ethers} from "hardhat";
import {getLastBlockInfo, mineBlocks, setBalance, setCoinbase} from "./helpers";
import {expect} from "chai";
import {BigNumber} from "ethers";

describe("validators: test voter claim reward", function () {

    let initialValidators:SignerWithAddress[]; // initiatial validators
    let voters:SignerWithAddress[]; // voters
    let validatorContract: Validators; // sut
    let reservePoolMock : ReservePoolMockForValidators; // mocked reservePool
    let deployer: SignerWithAddress;
    let admin: SignerWithAddress;

    const MAX_VALIDATORS = 29; // the max number of validators
    const INITIAL_FEE_SHARE = 2000; // initial commission fee rate for validator  20%
    const MIN_SELF_BALLOTS_IN_KCS = ethers.constants.WeiPerEther.mul(10000); // minimum Self Ballots denominated in KCS
    const MIN_SELF_BALLOTS = MIN_SELF_BALLOTS_IN_KCS.div(ethers.constants.WeiPerEther);

    beforeEach(async()=>{

        const signers = await ethers.getSigners();
        let others: SignerWithAddress[];
        [deployer, admin, ...others] = signers;

        validatorContract = await (await ethers.getContractFactory("Validators", deployer)).deploy()
        reservePoolMock = await (await ethers.getContractFactory("ReservePoolMockForValidators", deployer)).deploy()

        initialValidators = others.slice(0, MAX_VALIDATORS + 1); // 30 initial validators
        voters = others.slice(MAX_VALIDATORS+1); // voters

        // initial KCS in contract
        await setBalance(validatorContract.address,MIN_SELF_BALLOTS_IN_KCS.mul(initialValidators.length));
        await setBalance(reservePoolMock.address,ethers.constants.WeiPerEther.mul(10000));


        // initialize for the first time
        await validatorContract.initialize(
            initialValidators.map(v => v.address),
            initialValidators.map(v => v.address),
            initialValidators.map(v => INITIAL_FEE_SHARE), // 20% feeShare
            admin.address,
            validatorContract.address,
            ethers.constants.AddressZero,
            ethers.constants.AddressZero,
            reservePoolMock.address,100);


    });

    it("a voter who votes to 5 validators",async function(){

        // the voter
        const [voter] = voters;


        // voter's votes to each validator
        const voterVotes = [
            {
                votes: BigNumber.from(500),
                validator: initialValidators[4],
            },
            {
                votes: BigNumber.from(400),
                validator: initialValidators[3],
            },
            {
                votes: BigNumber.from(300),
                validator: initialValidators[2],
            },
            {
                votes: BigNumber.from(200),
                validator: initialValidators[1],
            },
            {
                votes: BigNumber.from(100),
                validator: initialValidators[0],
            }
        ];



        // vote to each validator
        for(let i=0; i< voterVotes.length; ++i){
            const vote = voterVotes[i];
            await validatorContract.connect(voter).vote(vote.validator.address,{
                value: vote.votes.mul(ethers.constants.WeiPerEther),
            })
        }

        let top5Validators = (await validatorContract.getTopValidators()).slice(0,5);
        expect(top5Validators).to.deep.equal(
            voterVotes.map(v=>v.validator.address)
        );


        // now , withdraw the votes to the first validator in voterVotes
        const votesWithdrawn = voterVotes[0].votes;
        const votesWithdrawnValidator = voterVotes[0].validator;

        await validatorContract.connect(voter).revokeVote(votesWithdrawnValidator.address,votesWithdrawn);

        voterVotes[0].votes  = BigNumber.from(0);
        voterVotes.sort((a,b)=>b.votes.sub(a.votes).toNumber()); // sort in ascending order

        // recheck the top 5 validators
        top5Validators = (await validatorContract.getTopValidators()).slice(0,5);
        // now in a new order
        expect(top5Validators).to.deep.equal(
            voterVotes.map(v=>v.validator.address)
        );


        // check user summary
        const summary = await validatorContract.getUserVotingSummary(voter.address);
        expect(summary.length).to.equal(voterVotes.length);

        const {timestamp}= await getLastBlockInfo();


        for(let i=0; i< summary.length; ++i){
            let {
                validator,
                validatorBallot,
                feeShares,
                ballot,
                pendingReward,
                revokingBallot,
                revokeLockingEndTime,
            } = summary[i];


            const [vote] = voterVotes.filter(v=> v.validator.address == validator);
            expect(vote).is.not.undefined;

            if(validator == votesWithdrawnValidator.address){
                // the validator from which the votes are withdrawn
                // all the ballots are now locking for withdrawing
                expect(revokingBallot).equal(votesWithdrawn);
                expect(revokeLockingEndTime).equal(BigNumber.from(3 *24 *60 *60).add(timestamp)); // locking for 3 days
            }else{
                expect(revokingBallot).equal(BigNumber.from(0));
                expect(revokeLockingEndTime).equal(BigNumber.from(0));
            }


            expect(validatorBallot).equal(MIN_SELF_BALLOTS.add(vote.votes));
            expect(feeShares).equal(INITIAL_FEE_SHARE);
            expect(ballot).equal(vote.votes);

            const poolAccRewardPerShare = await validatorContract.getPoolaccRewardPerShare(validator);
            const {rewardDebt, amount} = await validatorContract.userInfo(validator,voter.address);

            expect(amount).equal(vote.votes);
            expect(pendingReward).equal(poolAccRewardPerShare.mul(ballot).div(1e12).sub(rewardDebt));

        }


    });

    it("after voting, a candidate becomes one of the top validators",async function(){

        // we have 30 initial validators
        // but there can only be at most 29 validators
        // that means the last one of the initial validators is not in the active validators

        const unluckyCandidate = initialValidators[MAX_VALIDATORS];
        expect(await validatorContract.isActiveValidator(unluckyCandidate.address),
            "the unlucky last candidate is not an active validator")
            .to.be.false;

        expect(await validatorContract.getTopValidators(),
            "And the unlucky last candidate will not be in the top validators")
            .not.contains(unluckyCandidate.address);

        expect(await validatorContract.getPoolenabled(unluckyCandidate.address)).to.be.true;

        // here comes a voter
        const [someVoter] = voters;

        let votesBefore = await validatorContract.getPoolsuppliedBallot(unluckyCandidate.address);
        await validatorContract.connect(someVoter).vote(unluckyCandidate.address,{
            value: ethers.constants.WeiPerEther.mul(5) // vote 5 KCS to the unlucky candidate
        });
        let votesAfter = await validatorContract.getPoolsuppliedBallot(unluckyCandidate.address);

        expect(votesAfter.sub(votesBefore)).equal(BigNumber.from(5)); // got 5 more ballots

        expect((await validatorContract.getTopValidators()).length).to.equal(MAX_VALIDATORS);
        expect((await validatorContract.getTopValidators())[0],
            "And the unlucky last candidate is ranking the first in the top validators")
            .equal(unluckyCandidate.address);


        const summary = await validatorContract.getUserVotingSummary(someVoter.address);
        expect(summary.length).to.equal(1); // only one voting info

        for(let i=0; i< summary.length; ++i){
            let {
                validator,
                validatorBallot,
                feeShares,
                ballot,
                pendingReward,
                revokingBallot,
                revokeLockingEndTime,
            } = summary[i];

            expect(validator).equal(unluckyCandidate.address);
            expect(validatorBallot).equal(await validatorContract.getPoolsuppliedBallot(unluckyCandidate.address));
            expect(feeShares).equal(INITIAL_FEE_SHARE);
            expect(ballot).equal(BigNumber.from(5));

            const poolAccRewardPerShare = await validatorContract.getPoolaccRewardPerShare(unluckyCandidate.address);
            const {rewardDebt, amount} = await validatorContract.userInfo(unluckyCandidate.address,someVoter.address);

            expect(amount).equal(BigNumber.from(5));
            expect(pendingReward).equal(poolAccRewardPerShare.mul(ballot).div(1e12).sub(rewardDebt));
            expect(revokingBallot).equal(BigNumber.from(0));
            expect(revokeLockingEndTime).equal(BigNumber.from(0));
        }

    });


    it("claim reward", async function () {

        const [someVoter] = voters;
        let originBalance = await someVoter.getBalance();

        await validatorContract.connect(someVoter).vote(initialValidators[0].address,{
            value: ethers.constants.WeiPerEther.mul(5), // vote 5 KCS to the unlucky candidate
            gasPrice: 0,
        });

        await reservePoolMock.setBlockReward(ethers.constants.WeiPerEther.mul(5));
        await setCoinbase(admin.address);
        await validatorContract.connect(admin).distributeBlockReward();

        let acc = await validatorContract.getPoolaccRewardPerShare(initialValidators[0].address);

        let ballot = await validatorContract.getPoolSelfBallots(initialValidators[0].address)
        expect(await validatorContract.getPoolsuppliedBallot(initialValidators[0].address)).to.equal(ballot.add(5));

        expect(await someVoter.getBalance()).to.equal(originBalance.sub(ethers.constants.WeiPerEther.mul(5)));

        const summary = await validatorContract.getUserVotingSummary(someVoter.address);
        expect(summary.length).to.equal(1); // only one voting info

        let reward = summary[0].pendingReward

        for(let i = 0; i < summary.length; ++i) {
            let {
                validator,
                validatorBallot,
                feeShares,
                ballot,
                pendingReward,
                revokingBallot,
                revokeLockingEndTime,
            } = summary[i];


            expect(validator).equal(initialValidators[0].address);
            expect(validatorBallot).equal(await validatorContract.getPoolsuppliedBallot(initialValidators[0].address));
            expect(feeShares).equal(INITIAL_FEE_SHARE);
            expect(ballot).equal(BigNumber.from(5));

            const poolAccRewardPerShare = await validatorContract.getPoolaccRewardPerShare(initialValidators[0].address);
            const {rewardDebt, amount} = await validatorContract.userInfo(initialValidators[0].address, someVoter.address);

            expect(amount).equal(BigNumber.from(5));
            expect(pendingReward).equal(poolAccRewardPerShare.mul(ballot).div(1e12).sub(rewardDebt));
            expect(revokingBallot).equal(BigNumber.from(0));
            expect(revokeLockingEndTime).equal(BigNumber.from(0));
        }

        await validatorContract.connect(someVoter).claimReward(initialValidators[0].address, {gasPrice:0});

        await validatorContract.connect(someVoter).revokeVote(initialValidators[0].address, 5, {gasPrice:0});

        // wait for 3 days;
        // block interval is 3 seconds
        await mineBlocks(3 * 24 *60 * 60 / 3 + 1);

        if (await validatorContract.isWithdrawable(someVoter.address, initialValidators[0].address)) {
            await validatorContract.connect(someVoter).withdraw(initialValidators[0].address, {gasPrice:0})
        }

        await expect(await someVoter.getBalance()).to.equal(originBalance.add(reward));

    });



    it("vote with 1.5 KCS", async function () {

        // validator and voter to play with 
        const [val,] = initialValidators;
        const [user,] = voters;

        // the balance before voting 
        const preBalance = await user.getBalance();

        await validatorContract.connect(user).vote(val.address,{
            value: ethers.utils.parseEther("1.5"),
            gasPrice: BigNumber.from(0), // hack with 0 gas price 
        });

        const afterBalance = await user.getBalance();

        expect(
            preBalance.sub(afterBalance),
            "0.5 KCS should be returned"
        ).eq(
            ethers.utils.parseEther("1.0")
        )
        
    });

    it("automatically claim pending rewards when user votes", async function () {

        // validator and voter to play with 
        const [val,] = initialValidators;
        const [user,miner] = voters;

        await validatorContract.connect(user).vote(val.address,{
            value: ethers.utils.parseEther("1"),
            gasPrice: BigNumber.from(0), // hack with 0 gas price 
        });

        expect(
            await validatorContract.pendingReward(val.address,user.address),
            "there is no pending rewards before distributeBlockRewards"
        ).eq(
            BigNumber.from(0)
        )

        // Distribute some rewards  
        await setCoinbase(miner.address);
        await reservePoolMock.setBlockReward(ethers.utils.parseEther("6"));
        await validatorContract.connect(miner).distributeBlockReward();

        // user's pending rewards 
        const pendingRewards = await validatorContract.pendingReward(val.address,user.address);
        expect(pendingRewards).gt(BigNumber.from(0));
        
        // automatically claim pending rewards on voting 

        const preBlance = await user.getBalance();

        // vote 1 KCS 
        await validatorContract.connect(user).vote(val.address,{
                value: ethers.utils.parseEther("1"),
                gasPrice: BigNumber.from(0),
            });

        const afterBalance = await user.getBalance();

        expect(
            afterBalance.add(ethers.utils.parseEther("1")).sub(pendingRewards),
            "automatically claim pending rewards on voting "
        ).eq(
            preBlance
        )


    });


    it("automatically claim pending rewards when user revokes",async function () {

        // validator and voter to play with 
        const [val,] = initialValidators;
        const [user,miner] = voters;

        await validatorContract.connect(user).vote(val.address,{
            value: ethers.utils.parseEther("1"),
            gasPrice: BigNumber.from(0), // hack with 0 gas price 
        });

        expect(
            await validatorContract.pendingReward(val.address,user.address),
            "there is no pending rewards before distributeBlockRewards"
        ).eq(
            BigNumber.from(0)
        )

        // Distribute some rewards  
        await setCoinbase(miner.address);
        await reservePoolMock.setBlockReward(ethers.utils.parseEther("6"));
        await validatorContract.connect(miner).distributeBlockReward();

        // user's pending rewards 
        const pendingRewards = await validatorContract.pendingReward(val.address,user.address);
        expect(pendingRewards).gt(BigNumber.from(0));
        
        // automatically claim pending rewards on voting 

        const preBlance = await user.getBalance();

        // revoke 1 KCS 
        await validatorContract.connect(user).revokeVote(val.address, 1,{
                gasPrice: BigNumber.from(0),
        });

        const afterBalance = await user.getBalance();

        expect(
            afterBalance.sub(pendingRewards),
            "automatically claim pending rewards on reVoking "
        ).eq(
            preBlance
        )

    });


    it("automatically withdraw previous reovoked when revoke", async()=>{


        // validator and voter to play with 
        const [val,] = initialValidators;
        const [user,miner] = voters;

        // vote 2 KCS 
        await validatorContract.connect(user).vote(val.address,{
            value: ethers.utils.parseEther("2"),
            gasPrice: BigNumber.from(0), // hack with 0 gas price 
        });

        // revoke 1 KCS 
        await validatorContract.connect(user).revokeVote(val.address, 1,{
                gasPrice: BigNumber.from(0),
        });

        // wait for 3 days 
        await mineBlocks(3 * 24 * 60 * 60 / 3 + 1);

        expect(
            await validatorContract.connect(user).isWithdrawable(user.address,val.address),
        ).equal(
            true
        )

        const preBalance =await user.getBalance();

        // reovoke another KCS 
        await validatorContract.connect(user).revokeVote(val.address,1,
            {
                gasPrice: 0
            }
        )

        const afterBalance = await user.getBalance();

        expect(
            afterBalance.sub(preBalance)
        ).eq(
            ethers.constants.WeiPerEther
        );

    });


});