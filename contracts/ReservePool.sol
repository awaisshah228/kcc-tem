// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "./Params.sol";
import "./interfaces/IReservePool.sol";
import "./Admin.sol";

contract ReservePool is Params, Admin, IReservePool {
    enum State {
        DISABLED,
        ENABLED
    }

    // The Block Reward for each block
    uint256 public blockRewardAmount;
    // The maximum block reward amount
    uint256 public constant MAX_BLOCK_REWARD_AMOUNT = 100 ether;
    // Has block reward already withdrawn from this block?
    mapping(uint256 => uint256) internal _rewardWithdrawnRecords;

    // Events

    // Withdraw from reservePool
    event Withdraw(address indexed actor, uint256 amount);

    // Deposit to reservePool
    event Deposit(address indexed actor, uint256 amount);

    constructor() public {
        admin = msg.sender;
    }

    // The state of the reservePool:
    //  - DISABLED: no egc can be withrawn from the reservePool
    //  - ENABLED: egc can be withdrawn from the reservePool
    State public state;

    function initialize(
        address _admin,
        address _validatorsContract,
        address _punishContract,
        address _proposalContract,
        address _reservePool,
        uint256 _epoch
    ) external initializer {
        _Admin_Init(_admin);
        _setAddressesAndEpoch(
            _validatorsContract,
            _punishContract,
            _proposalContract,
            _reservePool,
            _epoch
        );
        state = State.ENABLED; // enabled after initialized
    }

    // Withdraw Block Reward from ReservePool
    // This method can only be called once per block and can only be called by ValidatorsContract.
    //
    //  @returns:  the amount withdrawn from ReservePool and received by msg.sender
    //
    function withdrawBlockReward()
        external
        override
        onlyValidatorsContract
        returns (uint256)
    {
        require(
            _rewardWithdrawnRecords[block.number] == 0,
            "multiple withdrawals in a single block"
        );

        if (state != State.ENABLED) {
            // reservePool not enabled
            return 0;
        }

        uint256 amount;

        if (address(this).balance > blockRewardAmount) {
            amount = blockRewardAmount;
        } else {
            amount = address(this).balance;
        }

        _rewardWithdrawnRecords[block.number] = 1;

        // solhint-disable avoid-low-level-calls
        (bool success, ) = msg.sender.call{value: amount}(new bytes(0));
        require(success, "ReservePool: egc transfer failed");

        emit Withdraw(msg.sender, amount);

        return amount;
    }

    // Set the state of reservePool:
    //   @params newState
    function setState(State newState) external onlyAdmin {
        require(
            newState == State.DISABLED || newState == State.ENABLED,
            "invalid state"
        );
        state = newState;
    }

    // Set the new block reward amount
    function setBlockRewardAmount(uint256 amount) external onlyAdmin {
        require(
            amount < MAX_BLOCK_REWARD_AMOUNT,
            "amount is greater than maximum"
        );
        blockRewardAmount = amount;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }
}
