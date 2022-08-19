/* tslint:disable */
/* eslint-disable */

// - updateActiveValidatorSet  & getActiveValidators 

import { ethers } from "hardhat";
import { expect } from "chai";
import {Punish, Validators} from "../typechain";
import {mineBlocks, setBalance, setCoinbase} from "./helpers";


type SignerWithAddress = Awaited<ReturnType<typeof ethers["getSigner"]>>;


describe("validators: activeset management", function () {

    // the validators contract
    let validatorContract: Validators;
    let deployer: SignerWithAddress;
    let admin: SignerWithAddress;
    let miner: SignerWithAddress;
    let candiates: SignerWithAddress[];
    let initialValidators: SignerWithAddress[];
    const epoch = 100;


    // constants
    const REDEEM_LOCK_DURATION = 3 * 24 * 60 * 60; // 3 days
    const FEE_SET_LOCKING_DURATION = 1 * 24 * 60 * 60; // 1 day
    const INITIAL_FEE_SHARE = 2000; // initial commission fee rate for validator
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
            ethers.constants.AddressZero,
            epoch);

    });

    it("get active validators", async function () {

        expect(await validatorContract.getTopValidators(),
            "check top validators")
            .to.be.deep.equal(
            initialValidators.map(v => v.address)
        );
    });

    it("update active validators", async function () {

        // block N = the last block of last epoch
        // wait for block N
        let currBlockNumber = await ethers.provider.getBlockNumber();
        if ((currBlockNumber + 1) % epoch != 0) {
           await mineBlocks(epoch - currBlockNumber % epoch - 1);
        }


        const newSetValidators = candiates.slice(0,7);

        await setCoinbase(miner.address);
        await validatorContract.connect(miner).updateActiveValidatorSet(newSetValidators.map(v => v.address))
        

        // old validators are not active validators anymore 
        for(let i=0; i < initialValidators.length; i++){
            expect(await validatorContract.isActiveValidator(initialValidators[i].address))
                .to.be.false;
        }

        // new validators 
        for(let i=0; i < newSetValidators.length; i++){
            expect(await validatorContract.isActiveValidator(newSetValidators[i].address))
                .to.be.true;
        }      
        
        
        expect(await validatorContract.getActiveValidators())
            .deep.equal(newSetValidators.map(v=>v.address));


    });
});
