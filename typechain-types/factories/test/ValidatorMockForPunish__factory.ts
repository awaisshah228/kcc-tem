/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  ValidatorMockForPunish,
  ValidatorMockForPunishInterface,
} from "../../test/ValidatorMockForPunish";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "validator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bool",
        name: "remove",
        type: "bool",
      },
    ],
    name: "CallPunish",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "val",
        type: "address",
      },
    ],
    name: "getPoolenabled",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "validator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "remove",
        type: "bool",
      },
    ],
    name: "punish",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50610113806100206000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c8063567133431460375780637c01f05314606e575b600080fd5b605a60048036036020811015604b57600080fd5b50356001600160a01b0316609b565b604080519115158252519081900360200190f35b609960048036036040811015608257600080fd5b506001600160a01b038135169060200135151560a1565b005b50600190565b604051811515906001600160a01b038416907f73f1a4caf233165bdd16cb19848abbcc17d2f01e655b3e2352f1610e0850b0d890600090a3505056fea2646970667358221220e51903effda83224f716fd41dd786386ec50b9a490d2d4c0594f5d8ea0b8a1c564736f6c634300060c0033";

type ValidatorMockForPunishConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ValidatorMockForPunishConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ValidatorMockForPunish__factory extends ContractFactory {
  constructor(...args: ValidatorMockForPunishConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ValidatorMockForPunish> {
    return super.deploy(overrides || {}) as Promise<ValidatorMockForPunish>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): ValidatorMockForPunish {
    return super.attach(address) as ValidatorMockForPunish;
  }
  override connect(signer: Signer): ValidatorMockForPunish__factory {
    return super.connect(signer) as ValidatorMockForPunish__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ValidatorMockForPunishInterface {
    return new utils.Interface(_abi) as ValidatorMockForPunishInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ValidatorMockForPunish {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as ValidatorMockForPunish;
  }
}
