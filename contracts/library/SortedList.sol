// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;


import "../interfaces/IValidators.sol";

library SortedLinkedList {
    struct List {
        address head;
        address tail;
        uint256 length;
        mapping(address => address) prev;
        mapping(address => address) next;
    }

    function improveRanking(
     List storage _list, 
     mapping(address=> IValidators.PoolInfo) storage poolInfos, 
     address _value)
    internal {
        //insert new
        if (_list.length == 0) {
            _list.head = _value;
            _list.tail = _value;
            _list.length++;
            return;
        }

        //already first
        if (_list.head == _value) {
            return;
        }

        address _prev = _list.prev[_value];
        // not in list
        if (_prev == address(0)) {
            //insert new
            _list.length++;

            if (poolInfos[ _value].suppliedBallots <= poolInfos[_list.tail].suppliedBallots) {
                _list.prev[_value] = _list.tail;
                _list.next[_list.tail] = _value;
                _list.tail = _value;

                return;
            }

            _prev = _list.tail;
        } else {
            if (poolInfos[ _value].suppliedBallots <= poolInfos[ _prev].suppliedBallots) {
                return;
            }

            //remove from list
            _list.next[_prev] = _list.next[_value];
            if (_value == _list.tail) {
                _list.tail = _prev;
            } else {
                _list.prev[_list.next[_value]] = _list.prev[_value];
            }
        }

        while (_prev != address(0) && poolInfos[ _value].suppliedBallots > poolInfos[ _prev].suppliedBallots) {
            _prev = _list.prev[_prev];
        }

        if (_prev == address(0)) {
            _list.next[_value] = _list.head;
            _list.prev[_list.head] = _value;
            _list.prev[_value] = address(0);
            _list.head = _value;
        } else {
            _list.next[_value] = _list.next[_prev];
            _list.prev[_list.next[_prev]] = _value;
            _list.next[_prev] = _value;
            _list.prev[_value] = _prev;
        }
    }


    function lowerRanking(
     List storage _list,
     mapping(address=> IValidators.PoolInfo) storage poolInfos,
     address _value)
    internal {
        address _next = _list.next[_value];
        if (_list.tail == _value || _next == address(0) || poolInfos[ _next].suppliedBallots <= poolInfos[ _value].suppliedBallots) {
            return;
        }

        //remove it
        _list.prev[_next] = _list.prev[_value];
        if (_list.head == _value) {
            _list.head = _next;
        } else {
            _list.next[_list.prev[_value]] = _next;
        }

        while (_next != address(0) && poolInfos[ _next].suppliedBallots > poolInfos[ _value].suppliedBallots) {
            _next = _list.next[_next];
        }

        if (_next == address(0)) {
            _list.prev[_value] = _list.tail;
            _list.next[_value] = address(0);

            _list.next[_list.tail] = _value;
            _list.tail = _value;
        } else {
            _list.next[_list.prev[_next]] = _value;
            _list.prev[_value] = _list.prev[_next];
            _list.next[_value] = _next;
            _list.prev[_next] = _value;
        }
    }


    function removeRanking(List storage _list, address _value)
    internal {
        if (_list.head != _value && _list.prev[_value] == address(0)) {
            //not in list
            return;
        }

        if (_list.tail == _value) {
            _list.tail = _list.prev[_value];
        }

        if (_list.head == _value) {
            _list.head = _list.next[_value];
        }

        address _next = _list.next[_value];
        if (_next != address(0)) {
            _list.prev[_next] = _list.prev[_value];
        }
        address _prev = _list.prev[_value];
        if (_prev != address(0)) {
            _list.next[_prev] = _list.next[_value];
        }

        _list.prev[_value] = address(0);
        _list.next[_value] = address(0);
        _list.length--;
    }
}
