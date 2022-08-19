// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;


contract ValidatorMockForProposal {
    address[] public activeValidators;


    function setActiveValidators(address val) external {
        activeValidators.push(val);
    }

    function getActiveValidators() external view returns (address[] memory) {
        return activeValidators;
    }

    function isActiveValidator(address val) external view returns (bool) {
        for(uint256 i =0; i < activeValidators.length; ++i){
            if (activeValidators[i] == val){
                return true;
            }
        }
        return false;
    }
}