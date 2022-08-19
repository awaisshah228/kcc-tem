// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "./interfaces/IValidators.sol";
import "./interfaces/IPunish.sol";
import "./interfaces/IProposal.sol";
import "./interfaces/IReservePool.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/Initializable.sol";
 
contract Params is Initializable {

    // System contracts addresses 
    IValidators public  VALIDATOR_CONTRACT; // solhint-disable var-name-mixedcase
    IPunish public  PUBLISH_CONTRACT;       // solhint-disable var-name-mixedcase
    IProposal public  PROPOSAL_CONTRACT;    // solhint-disable var-name-mixedcase
    IReservePool public RESERVEPOOL_CONTRACT; // solhint-disable var-name-mixedcase
    uint256 public EPOCH; // solhint-disable var-name-mixedcase

    // System params
    uint16 public constant MAX_VALIDATORS = 29;

    function _onlyMiner() private view {
        require(msg.sender == block.coinbase, "Miner only");
    }
    

    modifier onlyMiner() {
        _onlyMiner();
        _;
    }
    function _onlyPunishContract() private view {
        require(msg.sender == address(PUBLISH_CONTRACT), "Punish contract only");
    }

    modifier onlyPunishContract() {
        _onlyPunishContract();
        _;
    }
    

    modifier onlyBlockEpoch {
        require(block.number % EPOCH == 0, "Block epoch only");
        _;
    }

    modifier onlyValidatorsContract() {
        require(msg.sender == address(VALIDATOR_CONTRACT), "Validators contract only");
        _;

    }

    function _setAddressesAndEpoch(
            address _validatorsContract,
            address _punishContract,
            address _proposalContract,
            address _reservePool,
            uint256 epoch
    ) internal initializer{
        VALIDATOR_CONTRACT = IValidators(payable(_validatorsContract));
        PUBLISH_CONTRACT = IPunish(payable(_punishContract));
        PROPOSAL_CONTRACT = IProposal(payable(_proposalContract));
        RESERVEPOOL_CONTRACT = IReservePool(payable(_reservePool));
        EPOCH = epoch;
    }

}
