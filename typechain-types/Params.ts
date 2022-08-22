/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "./common";

export interface ParamsInterface extends utils.Interface {
  functions: {
    "EPOCH()": FunctionFragment;
    "MAX_VALIDATORS()": FunctionFragment;
    "PROPOSAL_CONTRACT()": FunctionFragment;
    "PUBLISH_CONTRACT()": FunctionFragment;
    "RESERVEPOOL_CONTRACT()": FunctionFragment;
    "VALIDATOR_CONTRACT()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "EPOCH"
      | "MAX_VALIDATORS"
      | "PROPOSAL_CONTRACT"
      | "PUBLISH_CONTRACT"
      | "RESERVEPOOL_CONTRACT"
      | "VALIDATOR_CONTRACT"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "EPOCH", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "MAX_VALIDATORS",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "PROPOSAL_CONTRACT",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "PUBLISH_CONTRACT",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "RESERVEPOOL_CONTRACT",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "VALIDATOR_CONTRACT",
    values?: undefined
  ): string;

  decodeFunctionResult(functionFragment: "EPOCH", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "MAX_VALIDATORS",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "PROPOSAL_CONTRACT",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "PUBLISH_CONTRACT",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "RESERVEPOOL_CONTRACT",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "VALIDATOR_CONTRACT",
    data: BytesLike
  ): Result;

  events: {};
}

export interface Params extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ParamsInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    EPOCH(overrides?: CallOverrides): Promise<[BigNumber]>;

    MAX_VALIDATORS(overrides?: CallOverrides): Promise<[number]>;

    PROPOSAL_CONTRACT(overrides?: CallOverrides): Promise<[string]>;

    PUBLISH_CONTRACT(overrides?: CallOverrides): Promise<[string]>;

    RESERVEPOOL_CONTRACT(overrides?: CallOverrides): Promise<[string]>;

    VALIDATOR_CONTRACT(overrides?: CallOverrides): Promise<[string]>;
  };

  EPOCH(overrides?: CallOverrides): Promise<BigNumber>;

  MAX_VALIDATORS(overrides?: CallOverrides): Promise<number>;

  PROPOSAL_CONTRACT(overrides?: CallOverrides): Promise<string>;

  PUBLISH_CONTRACT(overrides?: CallOverrides): Promise<string>;

  RESERVEPOOL_CONTRACT(overrides?: CallOverrides): Promise<string>;

  VALIDATOR_CONTRACT(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    EPOCH(overrides?: CallOverrides): Promise<BigNumber>;

    MAX_VALIDATORS(overrides?: CallOverrides): Promise<number>;

    PROPOSAL_CONTRACT(overrides?: CallOverrides): Promise<string>;

    PUBLISH_CONTRACT(overrides?: CallOverrides): Promise<string>;

    RESERVEPOOL_CONTRACT(overrides?: CallOverrides): Promise<string>;

    VALIDATOR_CONTRACT(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    EPOCH(overrides?: CallOverrides): Promise<BigNumber>;

    MAX_VALIDATORS(overrides?: CallOverrides): Promise<BigNumber>;

    PROPOSAL_CONTRACT(overrides?: CallOverrides): Promise<BigNumber>;

    PUBLISH_CONTRACT(overrides?: CallOverrides): Promise<BigNumber>;

    RESERVEPOOL_CONTRACT(overrides?: CallOverrides): Promise<BigNumber>;

    VALIDATOR_CONTRACT(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    EPOCH(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    MAX_VALIDATORS(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    PROPOSAL_CONTRACT(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    PUBLISH_CONTRACT(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    RESERVEPOOL_CONTRACT(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    VALIDATOR_CONTRACT(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}