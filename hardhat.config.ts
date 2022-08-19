import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import { BigNumber, utils} from "ethers"
import { fstatSync, mkdirSync, writeFileSync } from "fs";
import {join} from "path";
import keyethereum from "keythereum";
import  {readFileSync}  from 'fs';
import 'hardhat-storage-layout';
import {Md5} from 'ts-md5/dist/md5';
import  fs from "fs";
import'hardhat-contract-sizer';


dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }

});


// Calculate md5sum of byte codes
task("md5sum", "Calculate the md5sum of byte codes", async(taskArgs,hre) => {

  const files = [
   "bin/proposal_deployed_code",
   "bin/punish_deployed_code",
   "bin/reservePool_deployed_code",
   "bin/validators_deployed_code",
  ]

  for(let i =0; i < files.length; ++i){
    const bytes = utils.arrayify(fs.readFileSync(files[i],"utf8"));
    const hex = (new Md5()).appendByteArray(bytes).end(false);
    console.log(`${files[i]}: ${hex}`);
  }
  

})


// task for generating abi.json
task("abi-gen", "Generate abi.json", async (taskArgs, hre) => {

  // run compile task first 
  await hre.run("compile");

  // create a directory called abi
  const abiRootPath = join(hre.config.paths.root,"abi");
  mkdirSync(abiRootPath,{recursive:true});

  const exportedContracts =[ "Proposal", "Punish", "Validators", "ReservePool"];

  for(let i = 0; i < exportedContracts.length; ++i){

    const jsonFile = `${exportedContracts[i]}.json`;

    console.log(`\x1b[33m generating ${jsonFile} \x1b[0m`);

    writeFileSync(
      join(abiRootPath,jsonFile),
      JSON.stringify((await hre.artifacts.readArtifact(exportedContracts[i])).abi,null,2)
    );

  }

});


// helper function 
// import a privatekey from a keystore json file 
// FIXME: Looks like there are some bugs in the key derive fuction 
function importKeyFromJsonFile(filePath:string, password:string): string{
 const keyObject = JSON.parse(readFileSync(filePath).toString());
 return (keyethereum as any).recover(password,keyObject).toString('hex');
}


// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    version: "0.6.12",
    settings: {
        optimizer: {
            enabled: true,
            runs: 1
        },
        outputSelection: {
          "*": {
              "*": ["storageLayout"],
          },
        },
    }
  },
  networks: {
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    hardhat:{
      allowUnlimitedContractSize: true,
      accounts:{
        count: 100,
        accountsBalance: BigNumber.from(10).pow(25).toString()
      },
      hardfork: "berlin", // kcc 
      chainId: 1337
    },
    devnet:{
      url: process.env.DEVNET_RPC || "",
      accounts : (process.env.DENET_PRIVATE_KEYS || "0xa3f5fbad1692c5b72802300aefb5b760364018018ddb5fe7589a2203d0d10e60").split(','),
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    // only: [':ERC20$'],
  }
};



export default config;
