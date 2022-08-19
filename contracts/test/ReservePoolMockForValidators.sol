// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "../library/SafeSend.sol";

contract ReservePoolMockForValidators is SafeSend {

    uint256 public blockReward; 

    function withdrawBlockReward() external returns (uint256){
        _sendValue(payable(msg.sender),blockReward);
        return blockReward;
    }

    // solhint-disable no-empty-blocks
    receive() external payable{}

    function setBlockReward(uint256 r) public{
        blockReward = r;
    }
}