/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "./common";

export interface ReservePoolInterface extends utils.Interface {
  functions: {
    "EPOCH()": FunctionFragment;
    "MAX_BLOCK_REWARD_AMOUNT()": FunctionFragment;
    "MAX_VALIDATORS()": FunctionFragment;
    "PROPOSAL_CONTRACT()": FunctionFragment;
    "PUBLISH_CONTRACT()": FunctionFragment;
    "RESERVEPOOL_CONTRACT()": FunctionFragment;
    "VALIDATOR_CONTRACT()": FunctionFragment;
    "admin()": FunctionFragment;
    "blockRewardAmount()": FunctionFragment;
    "changeAdmin(address)": FunctionFragment;
    "initialize(address,address,address,address,address,uint256)": FunctionFragment;
    "setBlockRewardAmount(uint256)": FunctionFragment;
    "setState(uint8)": FunctionFragment;
    "state()": FunctionFragment;
    "withdrawBlockReward()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "EPOCH"
      | "MAX_BLOCK_REWARD_AMOUNT"
      | "MAX_VALIDATORS"
      | "PROPOSAL_CONTRACT"
      | "PUBLISH_CONTRACT"
      | "RESERVEPOOL_CONTRACT"
      | "VALIDATOR_CONTRACT"
      | "admin"
      | "blockRewardAmount"
      | "changeAdmin"
      | "initialize"
      | "setBlockRewardAmount"
      | "setState"
      | "state"
      | "withdrawBlockReward"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "EPOCH", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "MAX_BLOCK_REWARD_AMOUNT",
    values?: undefined
  ): string;
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
  encodeFunctionData(functionFragment: "admin", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "blockRewardAmount",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "changeAdmin",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "setBlockRewardAmount",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "setState",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(functionFragment: "state", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "withdrawBlockReward",
    values?: undefined
  ): string;

  decodeFunctionResult(functionFragment: "EPOCH", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "MAX_BLOCK_REWARD_AMOUNT",
    data: BytesLike
  ): Result;
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
  decodeFunctionResult(functionFragment: "admin", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "blockRewardAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "changeAdmin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setBlockRewardAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setState", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "state", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "withdrawBlockReward",
    data: BytesLike
  ): Result;

  events: {
    "Deposit(address,uint256)": EventFragment;
    "Withdraw(address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Deposit"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Withdraw"): EventFragment;
}

export interface DepositEventObject {
  actor: string;
  amount: BigNumber;
}
export type DepositEvent = TypedEvent<[string, BigNumber], DepositEventObject>;

export type DepositEventFilter = TypedEventFilter<DepositEvent>;

export interface WithdrawEventObject {
  actor: string;
  amount: BigNumber;
}
export type WithdrawEvent = TypedEvent<
  [string, BigNumber],
  WithdrawEventObject
>;

export type WithdrawEventFilter = TypedEventFilter<WithdrawEvent>;

export interface ReservePool extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ReservePoolInterface;

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

    MAX_BLOCK_REWARD_AMOUNT(overrides?: CallOverrides): Promise<[BigNumber]>;

    MAX_VALIDATORS(overrides?: CallOverrides): Promise<[number]>;

    PROPOSAL_CONTRACT(overrides?: CallOverrides): Promise<[string]>;

    PUBLISH_CONTRACT(overrides?: CallOverrides): Promise<[string]>;

    RESERVEPOOL_CONTRACT(overrides?: CallOverrides): Promise<[string]>;

    VALIDATOR_CONTRACT(overrides?: CallOverrides): Promise<[string]>;

    admin(overrides?: CallOverrides): Promise<[string]>;

    blockRewardAmount(overrides?: CallOverrides): Promise<[BigNumber]>;

    changeAdmin(
      _admin: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    initialize(
      _admin: PromiseOrValue<string>,
      _validatorsContract: PromiseOrValue<string>,
      _punishContract: PromiseOrValue<string>,
      _proposalContract: PromiseOrValue<string>,
      _reservePool: PromiseOrValue<string>,
      _epoch: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setBlockRewardAmount(
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setState(
      newState: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    state(overrides?: CallOverrides): Promise<[number]>;

    withdrawBlockReward(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  EPOCH(overrides?: CallOverrides): Promise<BigNumber>;

  MAX_BLOCK_REWARD_AMOUNT(overrides?: CallOverrides): Promise<BigNumber>;

  MAX_VALIDATORS(overrides?: CallOverrides): Promise<number>;

  PROPOSAL_CONTRACT(overrides?: CallOverrides): Promise<string>;

  PUBLISH_CONTRACT(overrides?: CallOverrides): Promise<string>;

  RESERVEPOOL_CONTRACT(overrides?: CallOverrides): Promise<string>;

  VALIDATOR_CONTRACT(overrides?: CallOverrides): Promise<string>;

  admin(overrides?: CallOverrides): Promise<string>;

  blockRewardAmount(overrides?: CallOverrides): Promise<BigNumber>;

  changeAdmin(
    _admin: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  initialize(
    _admin: PromiseOrValue<string>,
    _validatorsContract: PromiseOrValue<string>,
    _punishContract: PromiseOrValue<string>,
    _proposalContract: PromiseOrValue<string>,
    _reservePool: PromiseOrValue<string>,
    _epoch: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setBlockRewardAmount(
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setState(
    newState: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  state(overrides?: CallOverrides): Promise<number>;

  withdrawBlockReward(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    EPOCH(overrides?: CallOverrides): Promise<BigNumber>;

    MAX_BLOCK_REWARD_AMOUNT(overrides?: CallOverrides): Promise<BigNumber>;

    MAX_VALIDATORS(overrides?: CallOverrides): Promise<number>;

    PROPOSAL_CONTRACT(overrides?: CallOverrides): Promise<string>;

    PUBLISH_CONTRACT(overrides?: CallOverrides): Promise<string>;

    RESERVEPOOL_CONTRACT(overrides?: CallOverrides): Promise<string>;

    VALIDATOR_CONTRACT(overrides?: CallOverrides): Promise<string>;

    admin(overrides?: CallOverrides): Promise<string>;

    blockRewardAmount(overrides?: CallOverrides): Promise<BigNumber>;

    changeAdmin(
      _admin: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    initialize(
      _admin: PromiseOrValue<string>,
      _validatorsContract: PromiseOrValue<string>,
      _punishContract: PromiseOrValue<string>,
      _proposalContract: PromiseOrValue<string>,
      _reservePool: PromiseOrValue<string>,
      _epoch: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    setBlockRewardAmount(
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    setState(
      newState: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    state(overrides?: CallOverrides): Promise<number>;

    withdrawBlockReward(overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {
    "Deposit(address,uint256)"(
      actor?: PromiseOrValue<string> | null,
      amount?: null
    ): DepositEventFilter;
    Deposit(
      actor?: PromiseOrValue<string> | null,
      amount?: null
    ): DepositEventFilter;

    "Withdraw(address,uint256)"(
      actor?: PromiseOrValue<string> | null,
      amount?: null
    ): WithdrawEventFilter;
    Withdraw(
      actor?: PromiseOrValue<string> | null,
      amount?: null
    ): WithdrawEventFilter;
  };

  estimateGas: {
    EPOCH(overrides?: CallOverrides): Promise<BigNumber>;

    MAX_BLOCK_REWARD_AMOUNT(overrides?: CallOverrides): Promise<BigNumber>;

    MAX_VALIDATORS(overrides?: CallOverrides): Promise<BigNumber>;

    PROPOSAL_CONTRACT(overrides?: CallOverrides): Promise<BigNumber>;

    PUBLISH_CONTRACT(overrides?: CallOverrides): Promise<BigNumber>;

    RESERVEPOOL_CONTRACT(overrides?: CallOverrides): Promise<BigNumber>;

    VALIDATOR_CONTRACT(overrides?: CallOverrides): Promise<BigNumber>;

    admin(overrides?: CallOverrides): Promise<BigNumber>;

    blockRewardAmount(overrides?: CallOverrides): Promise<BigNumber>;

    changeAdmin(
      _admin: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    initialize(
      _admin: PromiseOrValue<string>,
      _validatorsContract: PromiseOrValue<string>,
      _punishContract: PromiseOrValue<string>,
      _proposalContract: PromiseOrValue<string>,
      _reservePool: PromiseOrValue<string>,
      _epoch: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setBlockRewardAmount(
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setState(
      newState: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    state(overrides?: CallOverrides): Promise<BigNumber>;

    withdrawBlockReward(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    EPOCH(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    MAX_BLOCK_REWARD_AMOUNT(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    MAX_VALIDATORS(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    PROPOSAL_CONTRACT(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    PUBLISH_CONTRACT(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    RESERVEPOOL_CONTRACT(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    VALIDATOR_CONTRACT(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    admin(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    blockRewardAmount(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    changeAdmin(
      _admin: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    initialize(
      _admin: PromiseOrValue<string>,
      _validatorsContract: PromiseOrValue<string>,
      _punishContract: PromiseOrValue<string>,
      _proposalContract: PromiseOrValue<string>,
      _reservePool: PromiseOrValue<string>,
      _epoch: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setBlockRewardAmount(
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setState(
      newState: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    state(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    withdrawBlockReward(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
