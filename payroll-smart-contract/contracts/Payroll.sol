// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Payroll {
    address public owner;
    address[] public pendingAdmins;
    address[] public pendingEmployees;
    address[] public approvedEmployees; // New array to store approved employees

    struct PayrollRecord {
        string ipfsHash; // IPFS hash of the encrypted payroll data
        address employee; // Employee address
        address employer; // Employer address
    }

    struct AdminRequest {
        string name;
        uint256 employeeId;
        string email;
        bool approved;
    }

    struct EmployeeRequest {
        string ipfsHash; // IPFS hash of employee data
        bool approved;
    }

    mapping(address => bool) public admins;
    mapping(address => string) public adminNames;
    mapping(address => uint256) public adminEmployeeIds;
    mapping(address => string) public adminEmails;
    mapping(uint256 => PayrollRecord) public payrollRecords;
    mapping(address => mapping(uint256 => bool)) public accessPermissions;
    mapping(address => AdminRequest) public adminRequests;
    mapping(address => EmployeeRequest) public employeeRequests;
    mapping(address => string) public employeeDataHashes; // IPFS hash of employee data

    // Events
    event EmployeeRegistered(address indexed employee, string ipfsHash);
    event EmployeeApproved(address indexed employee);

    // Constructor to set the owner during deployment
    constructor() {
        owner = msg.sender;
    }

    // Function to verify if an address is the owner
    function verifyOwner(address _address) external view returns (bool) {
        return _address == owner;
    }

    // Function to request admin role
    function requestAdminRole(string memory _name, uint256 _employeeId, string memory _email) external {
        require(!admins[msg.sender], "You are already an admin.");
        require(adminRequests[msg.sender].employeeId == 0, "You have already submitted a request.");

        adminRequests[msg.sender] = AdminRequest({
            name: _name,
            employeeId: _employeeId,
            email: _email,
            approved: false
        });
    }

    // Function to get pending admin requests
    function getPendingAdmins() external view returns (address[] memory) {
        return pendingAdmins;
    }

    // Function to approve an admin request (only owner can call this)
    function approveAdmin(address _adminAddress) external {
        require(msg.sender == owner, "Only owner can approve admins.");
        require(adminRequests[_adminAddress].employeeId != 0, "No request found for this address.");
        require(!adminRequests[_adminAddress].approved, "Request already approved.");

        admins[_adminAddress] = true;
        adminNames[_adminAddress] = adminRequests[_adminAddress].name;
        adminEmployeeIds[_adminAddress] = adminRequests[_adminAddress].employeeId;
        adminEmails[_adminAddress] = adminRequests[_adminAddress].email;
        adminRequests[_adminAddress].approved = true;

        // Remove the approved admin from the pendingAdmins array
        for (uint i = 0; i < pendingAdmins.length; i++) {
            if (pendingAdmins[i] == _adminAddress) {
                pendingAdmins[i] = pendingAdmins[pendingAdmins.length - 1];
                pendingAdmins.pop();
                break;
            }
        }
    }

    // Function to verify if an address is an admin
    function isAdmin(address _address) external view returns (bool) {
        return admins[_address];
    }

    // Function to reject an admin request
    function rejectAdmin(address _adminAddress) external {
        require(msg.sender == owner, "Only owner can reject admins.");
        require(adminRequests[_adminAddress].employeeId != 0, "No request found for this address.");
        require(!adminRequests[_adminAddress].approved, "Request already approved.");

        // Remove the rejected admin from the pendingAdmins array
        for (uint i = 0; i < pendingAdmins.length; i++) {
            if (pendingAdmins[i] == _adminAddress) {
                pendingAdmins[i] = pendingAdmins[pendingAdmins.length - 1];
                pendingAdmins.pop();
                break;
            }
        }

        // Delete the admin request
        delete adminRequests[_adminAddress];
    }

    // Function for employees to register and submit their data
    function registerEmployee(string memory ipfsHash) external {
        require(!employeeRequests[msg.sender].approved, "Employee already registered.");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty.");

        employeeRequests[msg.sender] = EmployeeRequest({
            ipfsHash: ipfsHash,
            approved: false
        });

        pendingEmployees.push(msg.sender);
        emit EmployeeRegistered(msg.sender, ipfsHash);
    }

    // Function for admins to approve employee requests
    function approveEmployee(address employee) external {
        require(admins[msg.sender], "Only admin can approve employees.");
        require(!employeeRequests[employee].approved, "Employee already approved.");
        require(bytes(employeeRequests[employee].ipfsHash).length > 0, "No request found for this employee.");

        employeeRequests[employee].approved = true;
        employeeDataHashes[employee] = employeeRequests[employee].ipfsHash;

        // Add the employee to the approvedEmployees array
        approvedEmployees.push(employee);

        // Remove the approved employee from the pendingEmployees array
        for (uint i = 0; i < pendingEmployees.length; i++) {
            if (pendingEmployees[i] == employee) {
                pendingEmployees[i] = pendingEmployees[pendingEmployees.length - 1];
                pendingEmployees.pop();
                break;
            }
        }

        emit EmployeeApproved(employee);
    }

    // Function to get pending employee requests
    function getPendingEmployees() external view returns (address[] memory) {
        return pendingEmployees;
    }

    // Function to get approved employees
    function getApprovedEmployees() external view returns (address[] memory) {
        return approvedEmployees;
    }

    // Function to get employee data hash
    function getEmployeeDataHash(address employee) external view returns (string memory) {
        return employeeDataHashes[employee];
    }

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