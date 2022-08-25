import { Validators } from './../typechain/Validators.d';
import { ReservePool } from './../typechain/ReservePool.d';
import { Punish } from './../typechain/Punish.d';
import { Proposal } from './../typechain/Proposal.d';
import { ethers } from 'hardhat';
import validatorData from '../utils/validator.json'
const fs = require('fs');
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
const util = require("util");
// import ethers from '@nomiclabs/hardhat-ethers'

interface Custom extends HardhatRuntimeEnvironment {
    [prop:string]:any;
    
}


const func: DeployFunction = async function (hre:Custom) {

    const signers = await ethers.getSigners();

    console.log('starting')
    const {getNamedAccounts , deployments, network } = hre
    const { deploy, run } = deployments
    const { deployer } = await getNamedAccounts()
    console.log(deployer)
    // const validatorObj=JSON.parse(validatorData)
    console.log(typeof validatorData)
    // console.log(validatorData)
    // const validatorAddress: string[]=[]
    const validAddress  = validatorData.map((valid)=>{
              return valid.validatorAddress
    })
    const managerAddress  = validatorData.map((valid)=>{
              return valid.validatorAddress
    })
    const poolFee  = validatorData.map((valid)=>{
              return valid.poolFee
    })
    
  // const root = await ethers.getContract('Root')

  await deploy("Proposal", {
    from: deployer,
    args: [],
    log: true,
  })
  await deploy("Punish", {
    from: deployer,
    args: [],
    log: true,
  })
  await deploy("ReservePool", {
    from: deployer,
    args: [],
    log: true,
  })
  await deploy("Validators", {
    from: deployer,
    args: [],
    log: true,
  })


 
      const Proposal = await ethers?.getContract('Proposal')
      const Punish = await ethers?.getContract('Punish')
      const ReservePool = await ethers?.getContract('ReservePool')
      const Validators = await ethers?.getContract('Validators')
       console.log(validatorData.length)
      const self=eval(`10000*${validatorData.length}`)
      console.log(self)
      const params = { to: Validators.address, value: ethers.utils.parseUnits(String(self), "ether").toHexString()};
      const txHash = await signers[0].sendTransaction(params);
      console.log("transactionHash is " + txHash); 

     
      

      await Proposal.initialize(
        deployer,
        Validators.address,
        Punish.address,
        Proposal.address,
        ReservePool.address,
        ethers.utils.parseEther('1')
      )
      await Punish.initialize(
        Validators.address,
        Punish.address,
        Proposal.address,
        ReservePool.address,
        deployer,
        ethers.utils.parseEther('1')
      );
      await ReservePool.initialize(
        deployer,
        Validators.address,
        Punish.address,
        Proposal.address,
        ReservePool.address,
        ethers.utils.parseEther('1')
      );
      await Validators.initialize(
        [...validAddress],
        [...managerAddress],
        [...poolFee],
        deployer,
        Validators.address,
        Punish.address,
        Proposal.address,
        ReservePool.address,
        ethers.utils.parseEther('1')
      );
      // console.log(registry)


  console.log("done")

   

  
};
export default func;