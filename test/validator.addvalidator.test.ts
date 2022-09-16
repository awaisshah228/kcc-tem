/* tslint:disable */
/* eslint-disable */

import { expect } from "chai";
import { ethers, network } from "hardhat";
import { Validators, ProposalMockForValidators } from "../typechain";
import { BigNumber } from "ethers"
import { getLastBlockInfo,setBalance} from "./helpers";
import { timeStamp } from "console";



type SignerWithAddress = Awaited<ReturnType<typeof ethers["getSigner"]>>;



// test suite 
describe("validators: addValidator", function () {


    // the validators contract 
    let validatorContract: Validators;
    let proposalMock: ProposalMockForValidators;
    let deployer: SignerWithAddress;
    let admin: SignerWithAddress;
    let candidates: SignerWithAddress[]; // candidates for validators
    let initialValidators: SignerWithAddress[]; // initial validators 

    // constants 
    const REDEEM_LOCK_DURATION = 3 * 24 * 60 * 60; // 3 days 
    const FEE_SET_LOCKING_DURATION = 1 * 24 * 60 * 60; // 1 day 
    const INITIAL_FEE_SHARE = 2000; // initial commission fee rate for validator （20%）
    const MIN_SELF_BALLOTS_IN_egc = ethers.constants.WeiPerEther.mul(10000); // minimum Self Ballots denominated in egc 
    const MIN_SELF_BALLOTS = MIN_SELF_BALLOTS_IN_egc.div(ethers.constants.WeiPerEther);

    beforeEach(async () => {

        const signers = await ethers.getSigners();
        let others: SignerWithAddress[];
        [deployer, admin, ...others] = signers;

        validatorContract = await (await ethers.getContractFactory("Validators", deployer)).deploy()
        proposalMock = await (await ethers.getContractFactory("ProposalMockForValidators", deployer)).deploy()


        initialValidators = others.slice(0, 7); // the first 7 candidate as the init validators
        candidates = others.slice(7); // the remaining are candidates 

        // initial egc in contract 
        await setBalance(validatorContract.address,MIN_SELF_BALLOTS_IN_egc.mul(initialValidators.length));
        

        // initialize for the first time 
        await validatorContract.initialize(
            initialValidators.map(v => v.address),
            initialValidators.map(v => v.address),
            initialValidators.map(v => INITIAL_FEE_SHARE),
            admin.address,
            validatorContract.address,
            ethers.constants.AddressZero,
            proposalMock.address, // proposal address 
            ethers.constants.AddressZero,100);

    });



    it("addValidator can only be called by admin or the validator in the proposal", async function () {

        let [candidateA, candidateB] = candidates;

        // candiateA's proposal 
        let proposalID = ethers.utils.hexZeroPad("0x1234", 32);
        await proposalMock.setPassed(candidateA.address, proposalID);

        validatorContract = validatorContract.connect(candidateB);
        await expect(validatorContract.addValidator(
            candidateA.address,
            ethers.constants.AddressZero,
            proposalID,
            INITIAL_FEE_SHARE,
            "candidate A",
            "http://",
            "kcc@kcc"),
            "candidateB cannot addValidator with a proposal from candidateA")
            .to.be.reverted;

        validatorContract = validatorContract.connect(candidateA);
        await expect(validatorContract.addValidator(
            candidateA.address,
            ethers.constants.AddressZero,
            proposalID,
            INITIAL_FEE_SHARE,
            "candidate A",
            "http://",
            "kcc@kcc"),
            "candidateA can addValidator with his own proposal")
            .not.to.be.reverted;

        // candiateB's proposal 
        proposalID = ethers.utils.hexZeroPad("0x12345678", 32);
        await proposalMock.setPassed(candidateB.address, proposalID);

        validatorContract = validatorContract.connect(candidateA);
        await expect(validatorContract.addValidator(
            candidateB.address,
            ethers.constants.AddressZero,
            proposalID,
            INITIAL_FEE_SHARE,
            "candidate B",
            "http://",
            "kcc@kcc"),
            "candidateA cannot addValidator with a proposal from candidateB")
            .to.be.reverted;

        validatorContract = validatorContract.connect(admin);
        await expect(validatorContract.addValidator(
            candidateB.address,
            ethers.constants.AddressZero,
            proposalID,
            INITIAL_FEE_SHARE,
            "candidate B",
            "http://",
            "kcc@kcc"),
            "admin can addValidator with candiateB's proposal")
            .not.to.be.reverted;
    });

    it("cannot add an already enabled validator", async function () {

        // some candidate 
        let [candidateA] = candidates;

        // construct 2 proposals for the same candidate 
        let p1 = ethers.utils.hexZeroPad("0x1111", 32);
        let p2 = ethers.utils.hexZeroPad("0x2222", 32);
        await proposalMock.setPassed(candidateA.address, p1);
        await proposalMock.setPassed(candidateA.address, p2);

        // call addValidator with the first proposal p1 
        validatorContract = validatorContract.connect(candidateA);
        await validatorContract.addValidator(
            candidateA.address,
            ethers.constants.AddressZero,
            p1,
            INITIAL_FEE_SHARE,
            "candidate A",
            "http://",
            "kcc@kcc")

        expect(await validatorContract.getPoolenabled(candidateA.address),
            "the pool of candidateA is enabled")
            .to.equal(true);

        // call addValidator with the second proposal  p2 
        validatorContract = validatorContract.connect(candidateA);
        await expect(validatorContract.addValidator(
            candidateA.address,
            ethers.constants.AddressZero,
            p2,
            INITIAL_FEE_SHARE,
            "candidate A",
            "http://",
            "kcc@kcc"),
            "There is already an enabled pool for candidateA, you cannot add another one.")
            .to.be.reverted;

        // disable the pool of candiateA 
        validatorContract = validatorContract.connect(admin);
        await validatorContract.setPoolStatus(candidateA.address, false);
        expect(await validatorContract.getPoolenabled(candidateA.address),
            "the pool of candidateA is disabled")
            .to.equal(false);

        // an disabled pool can be re-enabled
        validatorContract = validatorContract.connect(candidateA);
        await expect(validatorContract.addValidator(
            candidateA.address,
            ethers.constants.AddressZero,
            p2,
            INITIAL_FEE_SHARE,
            "candidate A",
            "http://",
            "kcc@kcc"),
            "If the existing pool is disabled, you can re-enable it")
            .not.to.be.reverted;


    });

    it("a proposal cannot be reused", async function () {

        // some candidate 
        let [candidateA] = candidates;

        // construct a proposal 
        let p1 = ethers.utils.hexZeroPad("0x1111", 32);
        await proposalMock.setPassed(candidateA.address, p1);


        // addValidator with proposal p1 
        validatorContract = validatorContract.connect(candidateA);
        await expect(validatorContract.addValidator(
            candidateA.address,
            ethers.constants.AddressZero,
            p1,
            INITIAL_FEE_SHARE,
            "candidate A",
            "http://",
            "kcc@kcc"),
            "addValidator with a proposal")
            .not.to.be.reverted;

        // disable this pool 
        // disable the pool of candidateA 
        validatorContract = validatorContract.connect(admin);
        await validatorContract.setPoolStatus(candidateA.address, false);
        expect(await validatorContract.getPoolenabled(candidateA.address),
            "the pool of candidateA is disabled")
            .to.equal(false);

        // try to re-enable this pool with the same proposal 
        validatorContract = validatorContract.connect(candidateA);
        await expect(validatorContract.addValidator(
            candidateA.address,
            ethers.constants.AddressZero,
            p1,
            INITIAL_FEE_SHARE,
            "candidate A",
            "http://",
            "kcc@kcc"),
            "a proposal cannot be reused")
            .to.be.reverted;

    });



    it("addvalidator with msg.value == 0", async function () {


        // some candidate 
        let [candidateA, candiateB] = candidates

        // construct a proposal for candidateA 
        let p1 = ethers.utils.hexZeroPad("0x1111", 32);
        await proposalMock.setPassed(candidateA.address, p1);

        // Add a pool for candidateA 
        validatorContract = validatorContract.connect(candidateA)
        await validatorContract.addValidator(candidateA.address,
            ethers.constants.AddressZero,
            p1,
            INITIAL_FEE_SHARE,
            "candiateA",
            "candiateA's website",
            "candiateA's email")

        // get block number & timestamp of previous tx 
        let { number: blockNumber, timestamp: blockTimeStamp } = await getLastBlockInfo();

        // info checks 
        expect(await validatorContract.getPoolSelfBallots(candidateA.address))
            .to.equal(BigNumber.from(0));
        expect(await validatorContract.getPoolSelfBallotsRewardsDebt(candidateA.address))
            .to.equal(BigNumber.from(0));
        expect(await validatorContract.getPoolpendingFee(candidateA.address))
            .to.equal(BigNumber.from(0));
        expect(await validatorContract.getPoolfeeDebt(candidateA.address))
            .to.equal(BigNumber.from(0));
        expect(await validatorContract.getPoollastRewardBlock(candidateA.address))
            .to.equal(BigNumber.from(blockNumber));
        expect(await validatorContract.getPoolfeeSettLockingEndTime(candidateA.address))
            .to.equal(BigNumber.from((blockTimeStamp == null ? 0 : blockTimeStamp + FEE_SET_LOCKING_DURATION)));
        expect(await validatorContract.getPoolsuppliedBallot(candidateA.address))
            .to.equal(BigNumber.from(0));
        expect(await validatorContract.getPoolaccRewardPerShare(candidateA.address))
            .to.equal(BigNumber.from(0));
        expect(await validatorContract.getPoolvoterNumber(candidateA.address))
            .to.equal(BigNumber.from(0));
        expect(await validatorContract.getPoolelectedNumber(candidateA.address))
            .to.equal(BigNumber.from(0));
        expect(await validatorContract.getPoolenabled(candidateA.address))
            .to.equal(true);

        
        // the margin is not enough, it should not be in the top validators 
        expect(await validatorContract.getTopValidators(),
            "the margin of candidateA is not enough, it should not be one of the top validators")
            .not.contains(candidateA.address);


    });


    it("addvalidator with msg.value == MIN_SELF_BALLOTS_IN_egc", async function () {
        // some candidate 
        let [candidateA, candidateB] = candidates

        // construct a proposal for candidateA 
        let p1 = ethers.utils.hexZeroPad("0x1111", 32);
        await proposalMock.setPassed(candidateA.address, p1);

        // Add a pool for candidateA 
        validatorContract = validatorContract.connect(candidateA)
        await validatorContract.addValidator(candidateA.address,
            ethers.constants.AddressZero,
            p1,
            INITIAL_FEE_SHARE,
            "candiateA",
            "candiateA's website",
            "candiateA's email",{
                value: MIN_SELF_BALLOTS_IN_egc, // enough marginAmount 
            })

        // get block number & timestamp of previous tx 
        let { number: blockNumber, timestamp: blockTimeStamp } = await getLastBlockInfo();

        // info checks 
        expect(await validatorContract.getPoolSelfBallots(candidateA.address))
            .to.equal(MIN_SELF_BALLOTS);
        expect(await validatorContract.getPoolsuppliedBallot(candidateA.address))
            .to.equal(MIN_SELF_BALLOTS); // votes 
        
        expect(await validatorContract.getPoolSelfBallotsRewardsDebt(candidateA.address))
            .to.equal(BigNumber.from(0));
        expect(await validatorContract.getPoolpendingFee(candidateA.address))
            .to.equal(BigNumber.from(0));
        expect(await validatorContract.getPoolfeeDebt(candidateA.address))
            .to.equal(BigNumber.from(0));
        expect(await validatorContract.getPoollastRewardBlock(candidateA.address))
            .to.equal(BigNumber.from(blockNumber));
        expect(await validatorContract.getPoolfeeSettLockingEndTime(candidateA.address))
            .to.equal(BigNumber.from((blockTimeStamp == null ? 0 : blockTimeStamp + FEE_SET_LOCKING_DURATION)));
        expect(await validatorContract.getPoolaccRewardPerShare(candidateA.address))
            .to.equal(BigNumber.from(0));
        expect(await validatorContract.getPoolvoterNumber(candidateA.address))
            .to.equal(BigNumber.from(0));
        expect(await validatorContract.getPoolelectedNumber(candidateA.address))
            .to.equal(BigNumber.from(0));
        expect(await validatorContract.getPoolenabled(candidateA.address))
            .to.equal(true);

   
        let {details,email,website}= await validatorContract.candidateInfos(candidateA.address);
        expect(details).to.equal("candiateA");
        expect(email).to.equal("candiateA's email");
        expect(website).to.equal("candiateA's website");

        
        // the margin is enough 
        expect(await validatorContract.getTopValidators(),
            "the margin of candidateA is enough")
            .contains(candidateA.address);
    });

    it("addvalidator with msg.value == 0.1 egc", async function () {
        // some candidate 
        let [candidateA, candiateB] = candidates

        // construct a proposal for candidateA 
        let p1 = ethers.utils.hexZeroPad("0x1111", 32);
        await proposalMock.setPassed(candidateA.address, p1);

        // Add a pool for candidateA 
        validatorContract = validatorContract.connect(candidateA)
        await expect(validatorContract.addValidator(candidateA.address,
            ethers.constants.AddressZero,
            p1,
            INITIAL_FEE_SHARE,
            "candiateA",
            "candiateA's website",
            "candiateA's email",{
                value: BigNumber.from(10).pow(17) // 0.1 egc
            }),
            "msg.value must be integer multiples of 1 ether")
            .to.be.reverted;
      
    });


    it("addvalidator : a pool can be reused", async function () {
        // some candidate 
        let [candidateA, candidateB] = candidates

        // construct a proposal for candidateA 
        let p1 = ethers.utils.hexZeroPad("0x1111", 32);
        await proposalMock.setPassed(candidateA.address, p1);

        // Add a pool for candidateA 
        validatorContract = validatorContract.connect(candidateA)
        await validatorContract.addValidator(candidateA.address,
            ethers.constants.AddressZero,
            p1,
            INITIAL_FEE_SHARE,
            "candiateA",
            "candiateA's website",
            "candiateA's email",{
                value: MIN_SELF_BALLOTS_IN_egc, // enough marginAmount 
            })

        // get block number & timestamp of previous tx 
        let { number: blockNumber, timestamp: blockTimeStamp } = await getLastBlockInfo();

        // info checks 
        expect(await validatorContract.getPoolSelfBallots(candidateA.address))
            .to.equal(MIN_SELF_BALLOTS);
        expect(await validatorContract.getPoolsuppliedBallot(candidateA.address))
            .to.equal(MIN_SELF_BALLOTS); // votes 

        
        // now, let's disable the pool 
        await validatorContract.connect(admin).setPoolStatus(candidateA.address,false);

        // then, re-enable this pool by adding it again 

        // first create another proposal 
        let p2 = ethers.utils.hexZeroPad("0x2222", 32);
        await proposalMock.setPassed(candidateA.address, p2);

        // re add a pool for candidateA 
        validatorContract = validatorContract.connect(candidateA)
        await validatorContract.addValidator(candidateA.address,
            ethers.constants.AddressZero,
            p2,
            INITIAL_FEE_SHARE,
            "candiateA",
            "candiateA's website",
            "candiateA's email",{
                value: MIN_SELF_BALLOTS_IN_egc, // add more margin 
            })     
            
        // margin will be accumulated to the same old pool 
        expect(await validatorContract.getPoolSelfBallots(candidateA.address))
            .to.equal(MIN_SELF_BALLOTS.add( MIN_SELF_BALLOTS) ); 
        expect(await validatorContract.getPoolsuppliedBallot(candidateA.address))
            .to.equal(MIN_SELF_BALLOTS.mul(2)); // votes       
        
        expect(await validatorContract.getPoolenabled(candidateA.address)).to.be.true;
    
    });

}); // end of describe 

