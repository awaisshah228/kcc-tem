// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "../interfaces/IValidators.sol";

contract CallDistributeBlockRewardMultipleTimes {


    IValidators public validators;

    constructor(address _validators) public{
        validators = IValidators(_validators);
    }

    function distributeBlockRewardMulti(uint256 times) external{
        for(uint i = 0; i< times; i++){
            validators.distributeBlockReward();
        }
    }
}