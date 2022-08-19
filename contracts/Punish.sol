// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "./Params.sol";
import "./interfaces/IValidators.sol";
import "./Admin.sol";

contract Punish is Params, Admin {
    uint256 public punishThreshold;
    uint256 public removeThreshold;
    uint256 public decreaseRate;

    struct PunishRecord {
        uint256 missedBlocksCounter;
        uint256 index;
        bool exist;
    }

    mapping(address => PunishRecord) internal _punishRecords;
    address[] public punishValidators;

    mapping(uint256 => bool) internal _punished;
    mapping(uint256 => bool) internal _decreased;

    event LogDecreaseMissedBlocksCounter();
    event LogPunishValidator(address indexed val, uint256 time);

    modifier onlyNotPunished() {
        require(!_punished[block.number], "Already _punished");
        _;
    }

    modifier onlyNotDecreased() {
        require(!_decreased[block.number], "Already _decreased");
        _;
    }

    function initialize(
        address _validatorsContract,
        address _punishContract,
        address _proposalContract,
        address _reservePool,
        address _admin,
        uint256 _epoch
    ) external initializer {
        _Admin_Init(_admin);
        _setAddressesAndEpoch(
            _validatorsContract,
            _punishContract,
            _proposalContract,
            _reservePool,
            _epoch
        );
        punishThreshold = 24;
        removeThreshold = 48;
        decreaseRate = 24;
    }

    function punish(address _val) external onlyMiner onlyNotPunished {
        _punished[block.number] = true;

        // Don't punish the validator again who was jailed
        if (!VALIDATOR_CONTRACT.getPoolenabled(_val)) {
            return;
        }
        if (!_punishRecords[_val].exist) {
            _punishRecords[_val].index = punishValidators.length;
            punishValidators.push(_val);
            _punishRecords[_val].exist = true;
        }
        _punishRecords[_val].missedBlocksCounter++;

        if (_punishRecords[_val].missedBlocksCounter % removeThreshold == 0) {
            VALIDATOR_CONTRACT.punish(_val, true);
            // reset validator's missed blocks counter
            _punishRecords[_val].missedBlocksCounter = 0;
            _cleanPunishRecord(_val);
        } else if (
            _punishRecords[_val].missedBlocksCounter % punishThreshold == 0
        ) {
            VALIDATOR_CONTRACT.punish(_val, false);
        }

        emit LogPunishValidator(_val, block.timestamp); // solhint-disable-line not-rely-on-time
    }

    function decreaseMissedBlocksCounter()
        external
        onlyMiner
        onlyNotDecreased
        onlyBlockEpoch
    {
        _decreased[block.number] = true;
        if (punishValidators.length == 0) {
            return;
        }

        for (uint256 i = 0; i < punishValidators.length; i++) {
            if (
                _punishRecords[punishValidators[i]].missedBlocksCounter >
                removeThreshold / decreaseRate
            ) {
                _punishRecords[punishValidators[i]].missedBlocksCounter =
                    _punishRecords[punishValidators[i]].missedBlocksCounter -
                    removeThreshold /
                    decreaseRate;
            } else {
                _punishRecords[punishValidators[i]].missedBlocksCounter = 0;
            }
        }

        emit LogDecreaseMissedBlocksCounter();
    }

    // clean validator's punish record if one vote in
    function _cleanPunishRecord(address _val) internal {
        if (_punishRecords[_val].missedBlocksCounter != 0) {
            _punishRecords[_val].missedBlocksCounter = 0;
        }

        // remove it out of array if exist
        if (_punishRecords[_val].exist && punishValidators.length > 0) {
            if (_punishRecords[_val].index != punishValidators.length - 1) {
                address _tail = punishValidators[punishValidators.length - 1];
                punishValidators[_punishRecords[_val].index] = _tail;

                _punishRecords[_tail].index = _punishRecords[_val].index;
            }
            punishValidators.pop();
            _punishRecords[_val].index = 0;
            _punishRecords[_val].exist = false;
        }
    }

    function getPunishValidatorsLen() public view returns (uint256) {
        return punishValidators.length;
    }

    function getPunishRecord(address val) public view returns (uint256) {
        return _punishRecords[val].missedBlocksCounter;
    }
}
