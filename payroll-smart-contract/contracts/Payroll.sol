// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Payroll {
    struct PayrollRecord {
        string ipfsHash; // IPFS hash of the encrypted payroll data
        address employee; // Employee address
        address employer; // Employer address
    }

    mapping(uint256 => PayrollRecord) public payrollRecords;
    mapping(address => mapping(uint256 => bool)) public accessPermissions;

    modifier onlyEmployer(uint256 recordId) {
        require(payrollRecords[recordId].employer == msg.sender, "Not the employer");
        _;
    }

    // Add a new payroll record
    function addPayrollRecord(uint256 recordId, string memory ipfsHash, address employee) public {
        payrollRecords[recordId] = PayrollRecord(ipfsHash, employee, msg.sender);
    }

    // Grant access to an employee
    function grantAccess(uint256 recordId, address employee) public onlyEmployer(recordId) {
        accessPermissions[employee][recordId] = true;
    }

    // Revoke access from an employee
    function revokeAccess(uint256 recordId, address employee) public onlyEmployer(recordId) {
        accessPermissions[employee][recordId] = false;
    }

    // Get the IPFS hash of a payroll record
    function getPayrollRecord(uint256 recordId) public view returns (string memory) {
        require(accessPermissions[msg.sender][recordId], "Not authorized");
        return payrollRecords[recordId].ipfsHash;
    }
}