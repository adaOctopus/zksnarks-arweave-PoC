// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Lock {
    uint public unlockTime;
    address payable public owner;
    event Withdrawal(uint amount, uint when);

    constructor(uint _unlockTime) payable {
        owner = payable(msg.sender);
        unlockTime = _unlockTime;
    }

    function withdraw() public {
        require(block.timestamp >= unlockTime, "You can't withdraw yet");
        require(msg.sender == owner, "You aren't the owner");
        emit Withdrawal(address(this).balance, block.timestamp);
        (bool success, ) = payable(msg.sender).call{value: address(this).balance}("");
        // what does payable do here
        require(success, "Transfer failed");

        //payable(msg.sender).transfer(address(this).balance);
    }
}
