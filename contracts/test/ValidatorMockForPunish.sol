// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;


contract ValidatorMockForPunish {

    event CallPunish(address indexed validator, bool indexed remove);

    function punish(address validator, bool remove) external{
        emit CallPunish(validator, remove);
    }

    function getPoolenabled(address val) external view returns (bool) {
        return true;
    }


}