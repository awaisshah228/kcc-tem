// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;


contract ProposalMockForValidators{


    // is a proposal passed ? 
    mapping(bytes32 => bool) private _passed;

    function setPassed(address val, bytes32 id) public{
        bytes32 hash = keccak256(abi.encode(val,id));
        _passed[hash] = true;
    }

    function isProposalPassed(address val, bytes32 id ) public view returns(bool){
        bytes32 hash = keccak256(abi.encode(val,id));
        return _passed[hash];
    }

}