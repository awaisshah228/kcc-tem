import { BigNumber } from 'ethers';
// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import * as fs from "fs";
// import { int } from "aws-sdk/clients/datapipeline";
const { network, run } = require("hardhat")



/* tslint:disable */
/* eslint-disable */

async function main() {
  // get address
  const signers = await ethers.getSigners();
  const accounts = signers.map((s) => s.address);

  const balance: any= await signers[0].getBalance()
  console.log('Starting balance',ethers.utils.formatEther(balance))
  const proposalFactory = await ethers.getContractFactory("Proposal");
  const proposalContract = await proposalFactory.deploy();

  await proposalContract.deployed();

  const proposalCode = await ethers.provider.getCode(proposalContract.address);
  console.log("proposalContract Adress ", proposalContract.address);
  // console.log("proposalCode ", proposalCode);

  fs.writeFileSync("./bin/proposal_deployed_code", proposalCode);

  // punish
  const punishFactory = await ethers.getContractFactory("Punish");
  const punishContract = await punishFactory.deploy();

  await proposalContract.deployed();

  const punishCode = await ethers.provider.getCode(punishContract.address);
  console.log("punishCode ", punishContract.address);

  fs.writeFileSync("./bin/punish_deployed_code", punishCode);

  // reserve pool
  const reservePoolFactory = await ethers.getContractFactory("ReservePool");
  const reservePoolContract = await reservePoolFactory.deploy();

  await reservePoolContract.deployed();

  const reservePoolCode = await ethers.provider.getCode(
    reservePoolContract.address
  );
  console.log("reservePoolCode ", reservePoolContract.address);

  fs.writeFileSync("./bin/reservePool_deployed_code", reservePoolCode);

  // validators
  const validatorsFactory = await ethers.getContractFactory("Validators");
  const validatorsContract = await validatorsFactory.deploy();

  await validatorsContract.deployed();

  const validatorsCode = await ethers.provider.getCode(
    validatorsContract.address
  );
  console.log("validatorsCode ", validatorsContract.address);

  fs.writeFileSync("./bin/validators_deployed_code", validatorsCode);
  console.log(validatorsCode.length);
  // intialinzing all contracts
  //   function initialize(
  //     address _admin,
  //     address _validatorsContract,
  //     address _punishContract,
  //     address _proposalContract,
  //     address _reservePool,
  //     uint256 _epoch
  // )

  await proposalContract.initialize(
    accounts[0],
    validatorsContract.address,
    punishContract.address,
    proposalContract.address,
    reservePoolContract.address,
    ethers.utils.parseEther('1')
  );
  console.log('i am done propsing')
  // propsal contract setup

  //intialiing punnish

  //   function initialize(
  //     address _validatorsContract,
  //     address _punishContract,
  //     address _proposalContract,
  //     address _reservePool,
  //     address _admin,
  //     uint256 _epoch
  // )
  await punishContract.initialize(
    validatorsContract.address,
    punishContract.address,
    proposalContract.address,
    reservePoolContract.address,
    accounts[0],
    ethers.utils.parseEther('1')
  );
  console.log('i am done punishing')

  //reservepool
  //   function initialize(
  //     address _admin,
  //     address _validatorsContract,
  //     address _punishContract,
  //     address _proposalContract,
  //     address _reservePool,
  //     uint256 _epoch
  // )
  await reservePoolContract.initialize(
    accounts[0],
    validatorsContract.address,
    punishContract.address,
    proposalContract.address,
    reservePoolContract.address,
    ethers.utils.parseEther('1')
  );
  console.log('i am done poolng')
  

  //   function initialize(
  //     address[] calldata _validators,
  //     address[] calldata _managers,
  //     uint256[] calldata _feeShares,
  //     address _admin,
  //     address _validatorsContract,
  //     address _punishContract,
  //     address _proposalContract,
  //     address _reservePool,
  //     uint256 _epoch
  // )
  await validatorsContract.initialize(
    [accounts[0]],
    [accounts[0]],
    [3000],
    accounts[0],
    validatorsContract.address,
    punishContract.address,
    proposalContract.address,
    reservePoolContract.address,
    ethers.utils.parseEther('1')
  );
  console.log('Successfull')
  const endingBalance: any= await signers[0].getBalance()
  console.log('Ending Balance',ethers.utils.formatEther(endingBalance))
  const cost: any = balance.sub(endingBalance);
  console.log('cost ',cost)
  

  
}
async function verify(address: string,){
  console.log(`verify  ${address} with arguments `)
  await run("verify:verify", {
    address,
  })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// proposalContract Adress  0x0B2d473E22AF5fE161E54Ad801B9aF172F23eDf1
// punishCode  0x8c4E37f413f4dAbDF82C02b609c26D8923a7b3EF
// reservePoolCode  0x815767B2c45De1CC6F2c8c8519B2EaCa0EBe053E
// validatorsCode  0xE3425114e3D0323Efc477a6027c5900941B5aF77

// proposalContract Adress  0x4679e90D973C1074ABA9402183Aba0F5Af6CC7d4
// punishCode  0xC7619d929c172B2286B19A878b513629Ccc2646F
// reservePoolCode  0xE7Db90F3e793BD0161D45dA2C06Fa44a77eD3825
// validatorsCode  0xe7150e3a903f3285ACd414De015b2eE656Ceb9dE

//ropsten testnet
// proposalContract Adress  0x21073602E1dD8CA6d36F00CB1c7EC0Aef7756ED9
// punishCode  0x815767B2c45De1CC6F2c8c8519B2EaCa0EBe053E
// reservePoolCode  0xE3425114e3D0323Efc477a6027c5900941B5aF77
// validatorsCode  0x4679e90D973C1074ABA9402183Aba0F5Af6CC7d4

//latest deploy

// proposalContract Adress  0x1E73C207507870c6AF3587c3846E1C47cf09Fc90
// punishCode  0x24Bbf17C5c87940ce7956218581F3F0eEE872AFa
// reservePoolCode  0xf69fa1EEbc02B0873Fda296F4080f6E52859d0b7
// validatorsCode  0x0220bA095e1Af0bCa9690D383abD7f28a4Bc278d
