// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

interface IReservePool {
    function withdrawBlockReward() external returns (uint256);
}
