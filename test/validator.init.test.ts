import { expect } from "chai";
import { ethers, network } from "hardhat";
import { Validators } from "../typechain";
import { BigNumber,BigNumberish } from "ethers"
import { getLastBlockInfo, setBalance } from "./helpers";
//import type {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";


type SignerWithAddress = Awaited<ReturnType<typeof ethers["getSigner"]>>;



// test suite 
describe("validators: init & admin's role", function () {


    // the validators contract 
    let validatorContract: Validators;
    let deployer: SignerWithAddress;
    let admin: SignerWithAddress;
    let initialValidators: SignerWithAddress[]; 

    // constants 
    const REDEEM_LOCK_DURATION = 3 * 24 * 60 * 60; // 3 days 
    const FEE_SET_LOCKING_DURATION = 1 * 24 * 60 * 60; // 1 day 
    const INITIAL_FEE_SHARE = 2000; // initial commission fee rate for validator 
    const MIN_SELF_BALLOTS_IN_egc = ethers.constants.WeiPerEther.mul(10000); // minimum Self Ballots denominated in egc in egc 
    const MIN_SELF_BALLOTS = MIN_SELF_BALLOTS_IN_egc.div(ethers.constants.WeiPerEther);

    beforeEach(async () => {

        const signers = await ethers.getSigners();
        let others:SignerWithAddress[];
        [deployer, admin, ...others] = signers;

        validatorContract = await (await ethers.getContractFactory("Validators", deployer)).deploy()

        initialValidators = others.slice(0, 7); // the first 7 candidate as the init validators


        // initial egc in contract 
        await setBalance(validatorContract.address,MIN_SELF_BALLOTS_IN_egc.mul(initialValidators.length));
        

        // initialize for the first time 
        await validatorContract.initialize(
            initialValidators.map(v => v.address),
            initialValidators.map(v => v.address),
            initialValidators.map(v => 2000), // 20% feeShare
            admin.address,
            validatorContract.address,
            ethers.constants.AddressZero,
            ethers.constants.AddressZero,
            ethers.constants.AddressZero,100);


    });


    it("initialization & initial validators", async function () {

        // we don't use the pre initialized validatorContract
        // we deploy a new one 
        validatorContract = await (await ethers.getContractFactory("Validators", deployer)).deploy();

        // initial egc in contract 
        await setBalance(validatorContract.address,MIN_SELF_BALLOTS_IN_egc.mul(initialValidators.length));

        // initialize for the first time 
        await validatorContract.initialize(
            initialValidators.map(v => v.address),
            initialValidators.map(v => v.address),
            initialValidators.map(v => 2000), // 20% feeShare
            admin.address,
            validatorContract.address,
            ethers.constants.AddressZero,
            ethers.constants.AddressZero,
            ethers.constants.AddressZero,100);
        

        // blockNumber: the block number when initializing 
        // timestamp: the timestamp when initializing 
        let { number: blockNumber, timestamp } = await getLastBlockInfo();


        // can not be initialized for a second time 
        await expect(validatorContract.initialize(
            initialValidators.map(v => v.address),
            initialValidators.map(v => v.address),
            initialValidators.map(v => INITIAL_FEE_SHARE), // 20% feeShare
            admin.address,
            validatorContract.address,
            ethers.constants.AddressZero,
            ethers.constants.AddressZero,
            ethers.constants.AddressZero,100),
            "validators contract can only be initialized once")
            .to.be.reverted;

        //
        // validate initialized states 
        // 

        for (let i = 0; i < initialValidators.length; ++i) {
            let addr = initialValidators[i].address;
            expect(await validatorContract.getPoolSelfBallots(addr))
                .to.equal(MIN_SELF_BALLOTS);
            expect(await validatorContract.getPoolSelfBallotsRewardsDebt(addr))
                .to.equal(BigNumber.from(0));
            expect(await validatorContract.getPoolpendingFee(addr))
                .to.equal(BigNumber.from(0));
            expect(await validatorContract.getPoolfeeDebt(addr))
                .to.equal(BigNumber.from(0));
            expect(await validatorContract.getPoollastRewardBlock(addr))
                .to.equal(BigNumber.from(blockNumber));
            expect(await validatorContract.getPoolfeeSettLockingEndTime(addr))
                .to.equal(BigNumber.from((timestamp == null ? 0 : timestamp + FEE_SET_LOCKING_DURATION)));
            expect(await validatorContract.getPoolsuppliedBallot(addr))
                .to.equal(MIN_SELF_BALLOTS);
            expect(await validatorContract.getPoolaccRewardPerShare(addr))
                .to.equal(BigNumber.from(0));
            expect(await validatorContract.getPoolvoterNumber(addr))
                .to.equal(BigNumber.from(0));
            expect(await validatorContract.getPoolelectedNumber(addr))
                .to.equal(BigNumber.from(0));
            expect(await validatorContract.getPoolenabled(addr))
                .to.equal(true);
        }

        // check total number of ballots 
        expect(await validatorContract.totalBallot())
            .to.be.equal(MIN_SELF_BALLOTS.mul(initialValidators.length));

        // check top validators 
        expect(await validatorContract.getTopValidators(),
            "check top validators")
            .to.be.deep.equal(
                initialValidators.map(v => v.address)
            );

    });

    it("non-admin is not allowed to change system parameters", async function () {

        // non-admin user is not allowed to change system parameters

        validatorContract.connect(deployer);
        await expect(validatorContract.setMinSelfBallots(1000),
            "only admin can change min margin amount")
            .to.be.reverted;

        await expect(validatorContract.setFeeSetLockingDuration(1000),
            "only admin can change fee set locking period")
            .to.be.reverted;

        await expect(validatorContract.setMaxPunishmentAmount(10),
            "only admin can change the maximum punishment amount")
            .to.be.reverted;

        await expect(validatorContract.setRevokeLockingDuration(1000),
            "only admin can change the redeem locking period")
            .to.be.reverted;

        await expect(validatorContract.setRevokeLockingDuration(1000),
            "only admin can change the redeem locking period")
            .to.be.reverted;

        await expect(validatorContract.setPoolStatus(initialValidators[0].address, false),
            "only admin can change the status of a pool directly")
            .to.be.reverted;

        await expect(validatorContract.updateCandidateInfo(initialValidators[0].address, "hello", "kcc", "world"),
            "only admin can change the descriptive meta of a validator")
            .to.be.reverted;

    });





}); // end of describe 
