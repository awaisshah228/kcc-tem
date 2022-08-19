/* tslint:disable */
/* eslint-disable */


import {Validators} from "../typechain";
import {ethers} from "hardhat";
import {setBalance} from "./helpers";
import {expect} from "chai";
import {BigNumber} from "ethers";

type SignerWithAddress = Awaited<ReturnType<typeof ethers["getSigner"]>>;


describe("validators: test for setxxx ", function () {
    // the validators contract
    let validatorContract: Validators;
    let deployer: SignerWithAddress;
    let admin: SignerWithAddress;
    let miner: SignerWithAddress;
    let candiates: SignerWithAddress[];
    let initialValidators: SignerWithAddress[];

    const MIN_SELF_BALLOTS_IN_KCS = ethers.constants.WeiPerEther.mul(10000); // minimum m


    beforeEach(async () => {

        const signers = await ethers.getSigners();
        let others:SignerWithAddress[];
        [deployer, admin, miner,...others] = signers;

        validatorContract = await (await ethers.getContractFactory("Validators", deployer)).deploy()

        initialValidators = others.slice(0, 7); // the first 7 candidate as the init validators

        candiates = others.slice(7);

        // initial KCS in contract
        await setBalance(validatorContract.address, MIN_SELF_BALLOTS_IN_KCS.mul(initialValidators.length));

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




    it("set self minimum ballot", async function () {
        const minimum = BigNumber.from(10000);

        await expect(await validatorContract.minSelfBallots()).to.equal(minimum);
        await expect(validatorContract.connect(admin).setMinSelfBallots(minimum)).to.be.reverted;
        await validatorContract.connect(admin).setMinSelfBallots(minimum.add(10000))
        await expect(await validatorContract.minSelfBallots()).to.equal(minimum.add(10000));
    });


    it("set max punishment amount", async function () {

        const amount = ethers.constants.WeiPerEther.mul(100);

        await expect(await validatorContract.maxPunishmentAmount()).to.equal(amount);
        await expect(validatorContract.connect(admin).setMaxPunishmentAmount(amount)).to.be.reverted;
        await validatorContract.connect(admin).setMaxPunishmentAmount(amount.add(100))
        await expect(await validatorContract.maxPunishmentAmount()).to.equal(amount.add(100));

    });

    it("set revoke locking duration", async function () {

        const oneDay = BigNumber.from(60 * 60 * 24).mul(3);

        await expect(await validatorContract.revokeLockingDuration()).to.equal(oneDay);
        await expect(validatorContract.connect(admin).setRevokeLockingDuration(oneDay)).to.be.reverted;
        await validatorContract.connect(admin).setRevokeLockingDuration(oneDay.mul(2));
        await expect(await validatorContract.connect(admin).revokeLockingDuration()).to.equal(oneDay.mul(2));

    });

    it("set the locking duration of update fee share rate", async function () {

        const oneDay = BigNumber.from(60 * 60 * 24).mul(1);

        await expect(await validatorContract.feeSetLockingDuration()).to.equal(oneDay);
        await expect(validatorContract.connect(admin).setFeeSetLockingDuration(oneDay)).to.be.reverted;
        await validatorContract.connect(admin).setFeeSetLockingDuration(oneDay.mul(2));
        await expect(await validatorContract.connect(admin).feeSetLockingDuration()).to.equal(oneDay.mul(2));

    });

    it("set the locking duration of self ballots", async function () {

        const days = BigNumber.from(60 * 60 * 24).mul(15);

        await expect(await validatorContract.marginLockingDuration()).to.equal(days);
        await expect(validatorContract.connect(admin).setMarginLockingDuration(days)).to.be.reverted;
        await validatorContract.connect(admin).setMarginLockingDuration(days.mul(2));
        await expect(await validatorContract.connect(admin).marginLockingDuration()).to.equal(days.mul(2));

    });

});