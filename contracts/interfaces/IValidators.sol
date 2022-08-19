// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;


interface IValidators {


    // Info of each pool.
    struct PoolInfo {
        address validator;   // Address of validator.
        address manager; 
        uint256 selfBallots;      // The validator's Margin in ballots
        uint256 selfBallotsRewardsDebt;  // The validator's reward debt corresponding to selfBallots 
        uint256 feeShares;   // The commission rate in 1/10000 
        uint256 pendingFee;  // The pending commission fee of the validator 
        uint256 feeDebt;     // The validators's commission fee debt, i.e, commission fees already withdrawn 
        uint256 lastRewardBlock;   // Last block number that the validator is rewarded
        uint256 feeSettLockingEndTime;  // feeShares can not be changed before feeSettLockingEndTime 
        uint256 suppliedBallots; // Total ballots voted to this validator 
        uint256 accRewardPerShare; // Accumulated KCSs per share, times 1e12.
        uint256 voterNumber; // The number of votes of the validator 
        uint256 electedNumber; // The number of times the validator is rewarded.
        bool enabled;    
    }

    // The detailed information of a validator 
    struct Description {
        string website;
        string email;
        string details;
    }

    // Info of each user.
    struct UserInfo {
        uint256 amount; // How many ballot tokens the user has provided.
        uint256 rewardDebt; // Reward debt.
    }


    // Info of each pool.
    struct VotingData {
        address validator;          //  The address of the validator 
        uint256 validatorBallot;    //  The total ballots of the validator 
        uint256 feeShares;          //  The commission rate of the validator in 1/10000
        uint256 ballot;             //  The user's ballots in this validator 
        uint256 pendingReward;          // The user's pending reward 
        uint256 revokingBallot;         // The user's revoking ballots 
        uint256 revokeLockingEndTime;   // The user can withdraw KSCs corresponding to revokingBallot after revokeLockingEndTime
    }

    // The Revoking info of a user's ballots
    struct RevokingInfo {
        uint256 amount; // The amount of ballots that user is revoking 
        uint256 lockingEndTime; // The user can withdraw his/her revoking ballots after lockingEndTime
    }

    enum Operation {Distributed, UpdatedValidators}

    function punish(address validator, bool remove) external; 


  
    // @dev This can only be called by the miner from the KCC node. 
    function distributeBlockReward() external payable;
    
    function updateActiveValidatorSet(address[] calldata newSet)  external;

    function getTopValidators()  external view returns (address[] memory); 

    function isActiveValidator(address val) external view returns (bool);

    function getActiveValidators() external view returns (address[] memory);

    function getPoolenabled(address val) external view returns (bool);

}

