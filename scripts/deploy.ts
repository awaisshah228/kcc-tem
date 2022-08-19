// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import * as fs from "fs";

/* tslint:disable */
/* eslint-disable */

async function main() {
 
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

  const reservePoolCode = await ethers.provider.getCode(reservePoolContract.address);
  console.log("reservePoolCode ", reservePoolContract.address);

  fs.writeFileSync("./bin/reservePool_deployed_code", reservePoolCode);

  // validators
  const validatorsFactory = await ethers.getContractFactory("Validators");
  const validatorsContract = await validatorsFactory.deploy();

  await validatorsContract.deployed();

  const validatorsCode = await ethers.provider.getCode(validatorsContract.address);
  console.log("validatorsCode ", validatorsContract.address);

  fs.writeFileSync("./bin/validators_deployed_code", validatorsCode);
  console.log(validatorsCode.length)

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
