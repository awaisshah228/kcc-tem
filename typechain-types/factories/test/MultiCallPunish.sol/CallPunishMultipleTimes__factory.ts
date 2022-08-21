/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  CallPunishMultipleTimes,
  CallPunishMultipleTimesInterface,
} from "../../../test/MultiCallPunish.sol/CallPunishMultipleTimes";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_punish",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "punish",
    outputs: [
      {
        internalType: "contract IPunish",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_val",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "times",
        type: "uint256",
      },
    ],
    name: "punishMultipleTimes",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506040516101b63803806101b68339818101604052602081101561003357600080fd5b5051600080546001600160a01b039092166001600160a01b0319909216919091179055610151806100656000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063826d3dec1461003b578063cb584ebe1461005f575b600080fd5b61004361008d565b604080516001600160a01b039092168252519081900360200190f35b61008b6004803603604081101561007557600080fd5b506001600160a01b03813516906020013561009c565b005b6000546001600160a01b031681565b60005b8181101561011657600080546040805163ea7221a160e01b81526001600160a01b0387811660048301529151919092169263ea7221a1926024808201939182900301818387803b1580156100f257600080fd5b505af1158015610106573d6000803e3d6000fd5b50506001909201915061009f9050565b50505056fea2646970667358221220b6c2c7d665f8a575c286837a330078dcdf6ccf42fb1aa0f31434ee1c738abb6c64736f6c634300060c0033";

type CallPunishMultipleTimesConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: CallPunishMultipleTimesConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class CallPunishMultipleTimes__factory extends ContractFactory {
  constructor(...args: CallPunishMultipleTimesConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _punish: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<CallPunishMultipleTimes> {
    return super.deploy(
      _punish,
      overrides || {}
    ) as Promise<CallPunishMultipleTimes>;
  }
  override getDeployTransaction(
    _punish: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_punish, overrides || {});
  }
  override attach(address: string): CallPunishMultipleTimes {
    return super.attach(address) as CallPunishMultipleTimes;
  }
  override connect(signer: Signer): CallPunishMultipleTimes__factory {
    return super.connect(signer) as CallPunishMultipleTimes__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): CallPunishMultipleTimesInterface {
    return new utils.Interface(_abi) as CallPunishMultipleTimesInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CallPunishMultipleTimes {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as CallPunishMultipleTimes;
  }
}
