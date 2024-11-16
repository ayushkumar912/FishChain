// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract InspectorAuthorization {
    address public government;
    mapping(address => bool) public authorizedInspectors;

    event InspectorAuthorized(address inspector);
    event InspectorRevoked(address inspector);

    modifier onlyGovernment() {
        require(
            msg.sender == government,
            "Only government can call this function"
        );
        _;
    }

    constructor() {
        government = msg.sender;
    }

    function authorizeInspector(address inspector) public onlyGovernment {
        authorizedInspectors[inspector] = true;
        emit InspectorAuthorized(inspector);
    }

    function revokeInspector(address inspector) public onlyGovernment {
        authorizedInspectors[inspector] = false;
        emit InspectorRevoked(inspector);
    }
}
