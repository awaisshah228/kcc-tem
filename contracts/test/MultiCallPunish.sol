// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "../interfaces/IPunish.sol";

contract CallPunishMultipleTimes {


    IPunish public punish;

    constructor(address _punish) public{
        punish = IPunish(_punish);
    }

    function punishMultipleTimes(address _val, uint256 times) external{
        for(uint i = 0; i< times; i++){
            punish.punish(_val);
        }
    }
}