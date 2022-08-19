/* tslint:disable */
/* eslint-disable */

// - setFeeSharesOfValidator  

import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import {Validators} from "../typechain";
import { mineBlocks, setBalance } from "./helpers";

type SignerWithAddress = Awaited<ReturnType<typeof ethers["getSigner"]>>;


describe("manager set fee shares of validator's pool", function () {
// the validators contract
        let validatorContract: Validators;
        let deployer: SignerWithAddress;
        let admin: SignerWithAddress;
        let manager: SignerWithAddress; // The manager of all the validators 
        let miner: SignerWithAddress;
        let initialValidators: SignerWithAddress[];
        const MIN_SELF_BALLOTS_IN_KCS = ethers.constants.WeiPerEther.mul(10000); // minimum Self Ballots denominated in KCS 
        const MIN_SELF_BALLOTS = MIN_SELF_BALLOTS_IN_KCS.div(ethers.constants.WeiPerEther);

        beforeEach(async () => {

            const signers = await ethers.getSigners();
            let others:SignerWithAddress[];
            [deployer, admin, miner, manager,...others] = signers;

            validatorContract = await (await ethers.getContractFactory("Validators", deployer)).deploy()

            initialValidators = others.slice(0, 7); // the first 7 candidate as the init validators

            // initial KCS in contract 
            await setBalance(validatorContract.address,MIN_SELF_BALLOTS_IN_KCS.mul(initialValidators.length));
        

            // initialize for the first time
            await validatorContract.initialize(
                initialValidators.map(v => v.address),
                initialValidators.map(v => manager.address), 
                initialValidators.map(v => 2000), // 20% feeShare
                admin.address,
                validatorContract.address,
                ethers.constants.AddressZero,
                ethers.constants.AddressZero,
                ethers.constants.AddressZero,100);

                // wait for a day 
                await mineBlocks( 24*60*60 / 3);

        });

        it("Set fee shares", async function () {
                
                // The validator to play with 
                const [val,] = initialValidators; 

                
                await expect(
                        validatorContract.connect(val).setFeeSharesOfValidator(1000,val.address)
                ).to.revertedWith(
                        "only manager can change it"
                );


                // msg.sender == manager 
                await validatorContract.connect(manager).setFeeSharesOfValidator(1000,val.address);

                expect(
                      await validatorContract.getPoolfeeShares(val.address)  
                ).equal(
                        BigNumber.from(1000)
                );


                // The minimum interval between two changes must be more than 24 hours
                await expect(
                        validatorContract.connect(manager).setFeeSharesOfValidator(800,val.address)
                ).to.revertedWith(
                        "Validators: one time of change within 24 hours."
                );
               
                // wait for a day 
                await mineBlocks( 24*60*60 / 3);

                // msg.sender == manager 
                // New feeshares cannot be greater that Max Fee Shares 
                await expect(
                        validatorContract.connect(manager).setFeeSharesOfValidator(4000,val.address)
                ).to.revertedWith(
                        "Validators: the fee shares should be in the range(0..3000)."
                );
              
                // wait for a day 
                await mineBlocks( 24*60*60 / 3 + 1);

                // disable the pool 
                await validatorContract.connect(admin).setPoolStatus(val.address,false);
                await expect(
                        validatorContract.connect(manager).setFeeSharesOfValidator(1500,val.address)
                ).revertedWith(
                        "pool is not enabled"
                )

        });

});