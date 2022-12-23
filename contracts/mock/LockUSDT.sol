// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "../interfaces/IPermit2.sol";

contract LockUSDT {
    mapping(address => uint256) balance;

    function lock(
        address permit2,
        IPermit2.PermitTransferFrom memory permit,
        IPermit2.SignatureTransferDetails calldata transferDetails,
        address owner,
        bytes calldata signature
    ) public {
        IPermit2(permit2).permitTransferFrom(
            permit,
            transferDetails,
            owner,
            signature
        );
        balance[msg.sender] += transferDetails.requestedAmount;
    }
}
