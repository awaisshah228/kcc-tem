// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

contract PunishMockForValidator {
    event CallPunish(address indexed validator, bool indexed remove);

    function punish(address validator, bool remove) external{
        emit CallPunish(validator, remove);
    }

    receive() external payable{}
}