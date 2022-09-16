/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  CallDistributeBlockRewardMultipleTimes,
  CallDistributeBlockRewardMultipleTimesInterface,
} from "../../../test/MultiCallDistributeBlockReward.sol/CallDistributeBlockRewardMultipleTimes";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_validators",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "times",
        type: "uint256",
      },
    ],
    name: "distributeBlockRewardMulti",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "validators",
    outputs: [
      {
        internalType: "contract IValidators",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5060405161018f38038061018f8339818101604052602081101561003357600080fd5b5051600080546001600160a01b039092166001600160a01b031990921691909117905561012a806100656000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c80631e5aa0b1146037578063ca1e7819146053575b600080fd5b605160048036036020811015604b57600080fd5b50356075565b005b605960e5565b604080516001600160a01b039092168252519081900360200190f35b60005b8181101560e157600080546040805163d6c0edad60e01b815290516001600160a01b039092169263d6c0edad9260048084019382900301818387803b15801560bf57600080fd5b505af115801560d2573d6000803e3d6000fd5b50506001909201915060789050565b5050565b6000546001600160a01b03168156fea26469706673582212207a7496fddf553ed48d0d760ea10e87a0d4beadd8076489b5d7031f4054be0b5c64736f6c634300060c0033";

type CallDistributeBlockRewardMultipleTimesConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: CallDistributeBlockRewardMultipleTimesConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class CallDistributeBlockRewardMultipleTimes__factory extends ContractFactory {
  constructor(
    ...args: CallDistributeBlockRewardMultipleTimesConstructorParams
  ) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _validators: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<CallDistributeBlockRewardMultipleTimes> {
    return super.deploy(
      _validators,
      overrides || {}
    ) as Promise<CallDistributeBlockRewardMultipleTimes>;
  }
  override getDeployTransaction(
    _validators: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_validators, overrides || {});
  }
  override attach(address: string): CallDistributeBlockRewardMultipleTimes {
    return super.attach(address) as CallDistributeBlockRewardMultipleTimes;
  }
  override connect(
    signer: Signer
  ): CallDistributeBlockRewardMultipleTimes__factory {
    return super.connect(
      signer
    ) as CallDistributeBlockRewardMultipleTimes__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): CallDistributeBlockRewardMultipleTimesInterface {
    return new utils.Interface(
      _abi
    ) as CallDistributeBlockRewardMultipleTimesInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CallDistributeBlockRewardMultipleTimes {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as CallDistributeBlockRewardMultipleTimes;
  }
}
