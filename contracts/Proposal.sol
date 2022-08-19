// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "./Params.sol";
import "./interfaces/IValidators.sol";
import "./Admin.sol";

contract Proposal is Params, Admin, IProposal {
    // How long a proposal will exist
    uint256 public proposalLastingPeriod;

    uint256 public proposalEffectivePeriod;

    // record
    // mapping(address => bool) public pass;
    mapping(bytes32 => bool) public pass;

    struct ProposalInfo {
        // who propose this proposal
        address proposer;
        // propose who to be a validator
        address dst;
        // optional detail info of proposal
        string details;
        // time create proposal
        uint256 createTime;
        //
        // vote info
        //
        // number agree this proposal
        uint16 agree;
        // number reject this proposal
        uint16 reject;
        // means you can get proposal of current vote.
        bool resultExist;
    }

    struct VoteInfo {
        address voter;
        uint256 voteTime;
        bool auth;
    }

    //  candiate address => the id of the latest proposal for the candidate
    mapping(address => bytes32) public latest;
    //  proposal id => proposalInfo
    mapping(bytes32 => ProposalInfo) public proposals;
    mapping(address => mapping(bytes32 => VoteInfo)) public votes;

    event LogCreateProposal(
        bytes32 indexed id,
        address indexed proposer,
        address indexed dst,
        uint256 time
    );
    event LogVote(
        bytes32 indexed id,
        address indexed voter,
        bool auth,
        uint256 time
    );
    event LogPassProposal(
        bytes32 indexed id,
        address indexed dst,
        uint256 time
    );
    event LogRejectProposal(
        bytes32 indexed id,
        address indexed dst,
        uint256 time
    );
    event LogSetUnpassed(address indexed val, bytes32 id, uint256 time);

    modifier onlyValidator() {
        // FIXME: is candidate?
        require(
            VALIDATOR_CONTRACT.isActiveValidator(msg.sender),
            "Validator only"
        );
        _;
    }

    function initialize(
        address _admin,
        address _validatorsContract,
        address _punishContract,
        address _proposalContract,
        address _reservePool,
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
        proposalLastingPeriod = 7 days;
        proposalEffectivePeriod = 30 days;
    }

    function createProposal(address dst, string calldata details)
        external
        onlyAdmin
        returns (bytes32)
    {
        // generate proposal id
        bytes32 id = keccak256(
            abi.encodePacked(msg.sender, dst, details, block.timestamp)
        );
        require(bytes(details).length <= 3000, "Details too long");
        require(proposals[id].createTime == 0, "Proposal already exists");

        ProposalInfo memory proposal;
        proposal.proposer = msg.sender;
        proposal.dst = dst;
        proposal.details = details;
        proposal.createTime = block.timestamp;

        proposals[id] = proposal;
        latest[dst] = id;

        emit LogCreateProposal(id, msg.sender, dst, block.timestamp);
        return id;
    }

    function isProposalPassed(address val, bytes32 id)
        external
        view
        override
        returns (bool)
    {
        require(latest[val] == id, "not matched");
        if (
            block.timestamp >
            proposals[id].createTime +
                proposalLastingPeriod +
                proposalEffectivePeriod
        ) {
            return false;
        } else {
            return pass[id];
        }
    }

    function getLatestProposalId(address val) external view returns (bytes32) {
        return latest[val];
    }

    function voteProposal(bytes32 id, bool auth)
        external
        onlyValidator
        returns (bool)
    {
        require(proposals[id].createTime != 0, "Proposal not exist");
        require(
            votes[msg.sender][id].voteTime == 0,
            "You can't vote for a proposal twice"
        );
        require(
            block.timestamp < proposals[id].createTime + proposalLastingPeriod,
            "Proposal expired"
        );

        votes[msg.sender][id].voteTime = block.timestamp;
        votes[msg.sender][id].voter = msg.sender;
        votes[msg.sender][id].auth = auth;
        emit LogVote(id, msg.sender, auth, block.timestamp);

        // update dst status if proposal is passed
        if (auth) {
            proposals[id].agree = proposals[id].agree + 1;
        } else {
            proposals[id].reject = proposals[id].reject + 1;
        }

        if (pass[id] || proposals[id].resultExist) {
            // do nothing if dst already passed or rejected.
            return true;
        }

        if (
            proposals[id].agree >=
            VALIDATOR_CONTRACT.getActiveValidators().length / 2 + 1
        ) {
            pass[id] = true;
            proposals[id].resultExist = true;

            emit LogPassProposal(id, proposals[id].dst, block.timestamp);

            return true;
        }

        if (
            proposals[id].reject >=
            VALIDATOR_CONTRACT.getActiveValidators().length / 2 + 1
        ) {
            pass[id] = false;
            proposals[id].resultExist = true;
            emit LogRejectProposal(id, proposals[id].dst, block.timestamp);
        }

        return true;
    }

    function setUnpassed(address val, bytes32 id)
        external
        onlyValidatorsContract
        returns (bool)
    {
        // set validator unpass
        pass[id] = false;

        emit LogSetUnpassed(val, id, block.timestamp);
        return true;
    }
}
