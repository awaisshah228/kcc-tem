/* tslint:disable */
/* eslint-disable */

import { expect } from "chai";
import { ethers } from "hardhat";
import {Proposal, ValidatorMockForProposal} from "../typechain";
import {Contract} from "ethers";

type SignerWithAddress = Awaited<ReturnType<typeof ethers["getSigner"]>>;


// test suite
describe("Test proposal", function () {
    let owner: SignerWithAddress;
    let admin: SignerWithAddress;
    let validator: SignerWithAddress;
    let validatorMockContract: Contract;
    let punishContract: SignerWithAddress;
    let proposalContract: SignerWithAddress;
    let reservePoolContract: SignerWithAddress;
    let proposal: Contract;

    let val1: SignerWithAddress;
    let val2: SignerWithAddress;
    let val3: SignerWithAddress;


    beforeEach(async  () => {

        [owner, admin, validator, punishContract, proposalContract, reservePoolContract, val1, val2, val3] = await ethers.getSigners();

        const validatorFactory = await ethers.getContractFactory("ValidatorMockForProposal", owner);
        validatorMockContract = await validatorFactory.deploy();

        const proposalFactory = await ethers.getContractFactory("Proposal", owner);
        proposal = await proposalFactory.deploy();

        // set validator for vote
        await validatorMockContract.setActiveValidators(val1.address);
        await validatorMockContract.setActiveValidators(val2.address);
        await validatorMockContract.setActiveValidators(val3.address);

        await proposal.initialize(
            admin.address,
            validatorMockContract.address,
            punishContract.address,
            proposal.address,
            reservePoolContract.address,100);

    });


    // test case
    it("initialization",async function() {

        await expect(
            proposal.initialize(
                admin.address,
                validatorMockContract.address,
                punishContract.address,
                proposalContract.address,
                reservePoolContract.address,100),
            "initialization should be only once").to.be.reverted;
        await expect(
            await proposal.admin(),
            "admin's addres should be the same",
        ).to.equal(admin.address);
    });



    it("create proposal", async function () {
        let proposalID = "";
        let proposalReceipt = await (await proposal.connect(admin).createProposal(validator.address, "create a proposal for validator")).wait();
        if (proposalReceipt.events != undefined) {
            // console.log(proposalReceipt.events[0].args)
            if (proposalReceipt.events[0].args != undefined) {
                proposalID = proposalReceipt.events[0].args.id
                // console.log(proposalReceipt.events[0].args.id);
            }
        }

        expect(
            await proposal.getLatestProposalId(validator.address),
            "proposal id should the same"
        ).to.equal(proposalID);

    });

    it("get the latest proposal id", async function () {
        let proposalID1 = "";
        let proposalID2 = "";
        let proposalReceipt1 = await (await proposal.connect(admin).createProposal(validator.address, "create a proposal for validator")).wait();
        if (proposalReceipt1.events != undefined) {
            // console.log(proposalReceipt1.events[0].args)
            if (proposalReceipt1.events[0].args != undefined) {
                proposalID1 = proposalReceipt1.events[0].args.id
                // console.log(proposalReceipt1.events[0].args.id);
            }
        }

        let proposalReceipt2 = await (await proposal.connect(admin).createProposal(validator.address, "create a proposal for validator")).wait();
        if (proposalReceipt2.events != undefined) {
            // console.log(proposalReceipt2.events[0].args)
            if (proposalReceipt2.events[0].args != undefined) {
                proposalID2 = proposalReceipt2.events[0].args.id
                // console.log(proposalReceipt2.events[0].args.id);
            }
        }

        await expect(
            await proposal.getLatestProposalId(validator.address),
            "get latest proposal id"
        ).to.not.equal(proposalID1);

        await expect(
            await proposal.getLatestProposalId(validator.address),
            "get latest proposal id"
        ).to.equal(proposalID2);
        });


    it("vote for proposal: pass", async function () {

        let proposalID = "";
        let proposalReceipt = await (await proposal.connect(admin).createProposal(validator.address, "create a proposal for validator")).wait();
        if (proposalReceipt.events != undefined) {
            // console.log(proposalReceipt.events[0].args)
            if (proposalReceipt.events[0].args != undefined) {
                proposalID = proposalReceipt.events[0].args.id
                // console.log(proposalReceipt.events[0].args.id);
            }
        }
        await proposal.connect(val1).voteProposal(proposalID, true);
        await proposal.connect(val2).voteProposal(proposalID, true);
        await proposal.connect(val3).voteProposal(proposalID, true);

        await expect(await proposal.isProposalPassed(validator.address, proposalID),
            "vote for pass"
        ).is.true;

        await expect(await proposal.isProposalPassed(validator.address, proposalID),
            "vote for pass"
        ).is.not.false;
    });

    it("vote for proposal: pass", async function () {

        let proposalID = "";
        let proposalReceipt = await (await proposal.connect(admin).createProposal(validator.address, "create a proposal for validator")).wait();
        if (proposalReceipt.events != undefined) {
            // console.log(proposalReceipt.events[0].args)
            if (proposalReceipt.events[0].args != undefined) {
                proposalID = proposalReceipt.events[0].args.id
                // console.log(proposalReceipt.events[0].args.id);
            }
        }
        await proposal.connect(val1).voteProposal(proposalID, true);
        await proposal.connect(val2).voteProposal(proposalID, true);
        await proposal.connect(val3).voteProposal(proposalID, false);

        await expect(await proposal.isProposalPassed(validator.address, proposalID),
            "vote for pass"
        ).is.true;

        await expect(await proposal.isProposalPassed(validator.address, proposalID),
            "vote for pass"
        ).is.not.false;
    });

    it("vote for proposal: reject", async function () {

        let proposalID = "";
        let proposalReceipt = await (await proposal.connect(admin).createProposal(validator.address, "create a proposal for validator")).wait();
        if (proposalReceipt.events != undefined) {
            // console.log(proposalReceipt.events[0].args)
            if (proposalReceipt.events[0].args != undefined) {
                proposalID = proposalReceipt.events[0].args.id
                // console.log(proposalReceipt.events[0].args.id);
            }
        }
        await proposal.connect(val1).voteProposal(proposalID, false);
        await proposal.connect(val2).voteProposal(proposalID, false);
        await proposal.connect(val3).voteProposal(proposalID, true);

        await expect(await proposal.isProposalPassed(validator.address, proposalID),
            "vote for pass"
        ).is.false;

        await expect(await proposal.isProposalPassed(validator.address, proposalID),
            "vote for pass"
        ).is.not.true;
    });

    it("vote for proposal: reject", async function () {

        let proposalID = "";
        let proposalReceipt = await (await proposal.connect(admin).createProposal(validator.address, "create a proposal for validator")).wait();
        if (proposalReceipt.events != undefined) {
            // console.log(proposalReceipt.events[0].args)
            if (proposalReceipt.events[0].args != undefined) {
                proposalID = proposalReceipt.events[0].args.id
                // console.log(proposalReceipt.events[0].args.id);
            }
        }
        await proposal.connect(val1).voteProposal(proposalID, false);
        await proposal.connect(val2).voteProposal(proposalID, true);

        await expect(await proposal.isProposalPassed(validator.address, proposalID),
            "vote for pass"
        ).is.false;

        await expect(await proposal.isProposalPassed(validator.address, proposalID),
            "vote for pass"
        ).is.not.true;
    });

    it("vote a proposal twice", async function () {

        let proposalID = "";
        let proposalReceipt = await (await proposal.connect(admin).createProposal(validator.address, "create a proposal for validator")).wait();
        if (proposalReceipt.events != undefined) {
            // console.log(proposalReceipt.events[0].args)
            if (proposalReceipt.events[0].args != undefined) {
                proposalID = proposalReceipt.events[0].args.id
                // console.log(proposalReceipt.events[0].args.id);
            }
        }
        await proposal.connect(val1).voteProposal(proposalID, true);


        await expect(proposal.connect(val1).voteProposal(proposalID, true),
            "vote a proposal only once"
        ).to.be.reverted;

        await expect(proposal.connect(val1).voteProposal(proposalID, false),
            "vote a proposal only once"
        ).to.be.reverted;
    });

    it("set a proposal unpassed", async function () {
        const proposalFactory = await ethers.getContractFactory("Proposal", owner);
        proposal = await proposalFactory.deploy();

        await proposal.initialize(
            admin.address,
            owner.address,
            punishContract.address,
            proposal.address,
            reservePoolContract.address,100);

        let proposalID = "";

        let proposalReceipt = await (await proposal.connect(admin).createProposal(validator.address, "create a proposal for validator")).wait();
        if (proposalReceipt.events != undefined) {
            // console.log(proposalReceipt.events[0].args)
            if (proposalReceipt.events[0].args != undefined) {
                proposalID = proposalReceipt.events[0].args.id
                // console.log(proposalReceipt.events[0].args.id);
            }
        }

        // console.log(await proposal.VALIDATOR_CONTRACT());
        // console.log(validatorMockContract.address);
        // console.log(owner.address);
        // console.log(await validatorMockContract.signer.getAddress());

        await expect(proposal.connect(owner).setUnpassed(validator.address, proposalID),
            "reject a proposal",
        ).to.not.reverted;

    });


}); // end of describe
