/* tslint:disable */
/* eslint-disable */

// - updateCandidateInfo



import {ProposalMockForValidators, Validators} from "../typechain";
import {ethers} from "hardhat";
import {setBalance} from "./helpers";
import {expect} from "chai";

type SignerWithAddress = Awaited<ReturnType<typeof ethers["getSigner"]>>;


describe("validators: test for update candidate info", function (){

    // the validators contract
    let validatorContract: Validators;
    let proposalMock: ProposalMockForValidators;
    let deployer: SignerWithAddress;
    let admin: SignerWithAddress;
    let initialValidators: SignerWithAddress[];
    let candidates: SignerWithAddress[]; // candidates for validators


    // constants
    const INITIAL_FEE_SHARE = 2000; // initial commission fee rate for validator
    const MIN_SELF_BALLOTS_IN_KCS = ethers.constants.WeiPerEther.mul(10000); // minimum Self Ballots denominated in KCS

    beforeEach(async () => {

        const signers = await ethers.getSigners();
        let others: SignerWithAddress[];
        [deployer, admin, ...others] = signers;

        validatorContract = await (await ethers.getContractFactory("Validators", deployer)).deploy();
        proposalMock = await (await ethers.getContractFactory("ProposalMockForValidators", deployer)).deploy();


        initialValidators = others.slice(0, 7); // the first 7 candidate as the init validators

        candidates = others.slice(7);

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
            proposalMock.address,
            ethers.constants.AddressZero,100);
    });


    it("update candidate info", async function () {

        // some candidate
        let [candidateA] = candidates;

        // construct a proposal for candidateA
        let p1 = ethers.utils.hexZeroPad("0x1111", 32);


        await proposalMock.setPassed(candidateA.address, p1);


        // Add a pool for candidateA
        validatorContract = validatorContract.connect(candidateA);
        await validatorContract.addValidator(
            candidateA.address,
            ethers.constants.AddressZero,
            p1,
            INITIAL_FEE_SHARE,
            "candidateA",
            "candidateA's website",
            "candidateA's email");
    

        let detailsStr = "candidateB";
        let websiteStr = "candidateB's website";
        let emailStr = "candidateB's email";


         
        await validatorContract.connect(admin).updateCandidateInfo(
            candidateA.address,
            detailsStr,
            websiteStr,
            emailStr);

        let {details, email, website} = await validatorContract.candidateInfos(candidateA.address);
        expect(details).to.deep.equal(detailsStr);
        expect(email).to.deep.equal(emailStr);
        expect(website).to.deep.equal(websiteStr);
    })
});