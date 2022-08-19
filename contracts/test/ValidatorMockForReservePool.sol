// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "../interfaces/IReservePool.sol";

contract ValidatorMockForReservePool {

    IReservePool public reservePool; 
    uint256   public lastWithdrawAmount; 


    function setReservePool(address pool) public{
        reservePool = IReservePool(pool);
    }

    function withdrawBlockReward() external returns(uint256) {
        lastWithdrawAmount = reservePool.withdrawBlockReward();
        return lastWithdrawAmount;
    }

    // solhint-disable no-empty-blocks
    receive() external payable{}

}