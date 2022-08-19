import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {ethers} from "hardhat";
import { join } from "path";
import { deployContractToAddress, setBalance, setCoinbase } from "../../test/helpers";
import { Proposal, Punish, ReservePool, Validators } from "../../typechain";
import { deployMulticall } from "./deploy-multicall";


// TODO:  
//  1. deploy all components  
//  2. 
//  3. Mining Loop:  
//     - each validator will mine a block in-turn  
//    


async function main() {

    const signers = await ethers.getSigners();

    ///
    /// 1. deployer: the deployer of the contracts 
    /// 2. admin: the admin of all validators 
    /// 3. val1, val2, val3: 3 active validators 
    /// 4. val4 is a jailed validator 
    const [deployer, admin, val1,val2,val3, val4, ...others] = signers;


    const VALIDATOR_CONTRACT_ADDRESS = "0x000000000000000000000000000000000000f333";
    const PUNISH_CONTRACT_ADDRESS = "0x000000000000000000000000000000000000f444";
    const PROPOSAL_CONTRACT_ADDRESS = "0x000000000000000000000000000000000000f555";
    const RESERVE_POOL_ADDRESS = "0x000000000000000000000000000000000000f999";

    const MULTICALL_ADDRESS = "0xfffffffffffffffffffffffffffffffffffff999"

    const INITIAL_FEE_SHARE = 2000; // initial commission fee rate for validator 
    const MIN_SELF_BALLOTS_IN_KCS = ethers.constants.WeiPerEther.mul(10000); // minimum Self Ballots denominated in KCS 
    const MIN_SELF_BALLOTS = MIN_SELF_BALLOTS_IN_KCS.div(ethers.constants.WeiPerEther);
    const EPOCH = 100; 


    console.log(`Deploying validators & related contracts...`);


    // deploy contracts 
    const validatorContract = await deployContractToAddress(VALIDATOR_CONTRACT_ADDRESS,"Validators",deployer) as Validators ;
    const reservePoolContract = await deployContractToAddress(RESERVE_POOL_ADDRESS,"ReservePool",deployer) as ReservePool ;
    const proposalContract =  await deployContractToAddress(PROPOSAL_CONTRACT_ADDRESS,"Proposal",deployer) as Proposal ;
    const punishContract =  await deployContractToAddress(PUNISH_CONTRACT_ADDRESS,"Punish",deployer) as Punish;



    const initialValidators = [val1,val2,val3,val4];

    // initialize Validators 
    await setBalance(validatorContract.address,MIN_SELF_BALLOTS_IN_KCS.mul(initialValidators.length));
    await validatorContract.initialize(
        initialValidators.map(v => v.address),
        initialValidators.map(v => v.address),
        initialValidators.map(v => 2000), // 20% feeShare
        admin.address,
        validatorContract.address,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        reservePoolContract.address,EPOCH);

    // initialize reservePoolContract 
    await setBalance(reservePoolContract.address,MIN_SELF_BALLOTS_IN_KCS.mul(30));
    await reservePoolContract.initialize(admin.address,
                validatorContract.address,
                punishContract.address,
                proposalContract.address,
                reservePoolContract.address,EPOCH);
    await reservePoolContract.connect(admin).setBlockRewardAmount(ethers.utils.parseEther("0.1"));

    // initialize proposalContract 
    await proposalContract.initialize(admin.address,
        validatorContract.address,
        punishContract.address,
        proposalContract.address,
        reservePoolContract.address,EPOCH);

    // initialize punishContract 
    await punishContract.initialize(validatorContract.address,
        punishContract.address,
        proposalContract.address,
        reservePoolContract.address,
        admin.address,EPOCH);
     
    // Disable validator 4 
    await validatorContract.connect(admin).setPoolStatus(val4.address,false);

    // deploy multicall 
    await deployMulticall(MULTICALL_ADDRESS);

    console.log(`Finished deploying validators & related contracts...`);
    
    console.log(`Multicall contract Address is: ${MULTICALL_ADDRESS}`);
    console.log(`Validators Contract Address is ${VALIDATOR_CONTRACT_ADDRESS}`);
    console.log(`Use this private key to test: 0xa3f5fbad1692c5b72802300aefb5b760364018018ddb5fe7589a2203d0d10e60`);

    await setCoinbase(admin.address); // the fake miner 
    setInterval(async()=>{

        // mine a block every 3s 
        await validatorContract.connect(admin).distributeBlockReward();

    },3000);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  

