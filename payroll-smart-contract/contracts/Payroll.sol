// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Payroll {
    address public owner;
    address[] public pendingAdmins;
    address[] public pendingEmployees;
    address[] public approvedEmployees;

    struct PayrollRecord {
        string ipfsHash;
        address employee;
        address employer;
    }

    struct AdminRequest {
        string name;
        uint256 employeeId;
        string email;
        bool approved;
    }

    struct EmployeeRequest {
        string ipfsHash;
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
    mapping(address => string) public employeeDataHashes;

    event EmployeeRegistered(address indexed employee, string ipfsHash);
    event EmployeeApproved(address indexed employee);
    event EmployeeRejected(address indexed employee);

    constructor() {
        owner = msg.sender;
    }

    function verifyOwner(address _address) external view returns (bool) {
        return _address == owner;
    }

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

    function getPendingAdmins() external view returns (address[] memory) {
        return pendingAdmins;
    }

    function approveAdmin(address _adminAddress) external {
        require(msg.sender == owner, "Only owner can approve admins.");
        require(adminRequests[_adminAddress].employeeId != 0, "No request found for this address.");
        require(!adminRequests[_adminAddress].approved, "Request already approved.");

        admins[_adminAddress] = true;
        adminNames[_adminAddress] = adminRequests[_adminAddress].name;
        adminEmployeeIds[_adminAddress] = adminRequests[_adminAddress].employeeId;
        adminEmails[_adminAddress] = adminRequests[_adminAddress].email;
        adminRequests[_adminAddress].approved = true;

        for (uint i = 0; i < pendingAdmins.length; i++) {
            if (pendingAdmins[i] == _adminAddress) {
                pendingAdmins[i] = pendingAdmins[pendingAdmins.length - 1];
                pendingAdmins.pop();
                break;
            }
        }
    }

    function isAdmin(address _address) external view returns (bool) {
        return admins[_address];
    }

    function rejectAdmin(address _adminAddress) external {
        require(msg.sender == owner, "Only owner can reject admins.");
        require(adminRequests[_adminAddress].employeeId != 0, "No request found for this address.");
        require(!adminRequests[_adminAddress].approved, "Request already approved.");

        for (uint i = 0; i < pendingAdmins.length; i++) {
            if (pendingAdmins[i] == _adminAddress) {
                pendingAdmins[i] = pendingAdmins[pendingAdmins.length - 1];
                pendingAdmins.pop();
                break;
            }
        }

        delete adminRequests[_adminAddress];
    }

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

    function approveEmployee(address employee) external {
        require(admins[msg.sender], "Only admin can approve employees.");
        require(!employeeRequests[employee].approved, "Employee already approved.");
        require(bytes(employeeRequests[employee].ipfsHash).length > 0, "No request found for this employee.");

        employeeRequests[employee].approved = true;
        employeeDataHashes[employee] = employeeRequests[employee].ipfsHash;
        approvedEmployees.push(employee);

        for (uint i = 0; i < pendingEmployees.length; i++) {
            if (pendingEmployees[i] == employee) {
                pendingEmployees[i] = pendingEmployees[pendingEmployees.length - 1];
                pendingEmployees.pop();
                break;
            }
        }

        emit EmployeeApproved(employee);
    }

    function rejectEmployee(address employee) external {
        require(admins[msg.sender], "Only admin can reject employees.");
        require(!employeeRequests[employee].approved, "Employee already approved.");

        for (uint i = 0; i < pendingEmployees.length; i++) {
            if (pendingEmployees[i] == employee) {
                pendingEmployees[i] = pendingEmployees[pendingEmployees.length - 1];
                pendingEmployees.pop();
                break;
            }
        }

        delete employeeRequests[employee];
        emit EmployeeRejected(employee);
    }

    function getPendingEmployees() external view returns (address[] memory) {
        return pendingEmployees;
    }

    function getApprovedEmployees() external view returns (address[] memory) {
        return approvedEmployees;
    }

    function getEmployeeDetails(address employee) external view returns (EmployeeRequest memory) {
        return employeeRequests[employee];
    }

    modifier onlyEmployer(uint256 recordId) {
        require(payrollRecords[recordId].employer == msg.sender, "Not the employer");
        _;
    }

    function addPayrollRecord(uint256 recordId, string memory ipfsHash, address employee) public {
        payrollRecords[recordId] = PayrollRecord(ipfsHash, employee, msg.sender);
    }

    function grantAccess(uint256 recordId, address employee) public onlyEmployer(recordId) {
        accessPermissions[employee][recordId] = true;
    }

    function revokeAccess(uint256 recordId, address employee) public onlyEmployer(recordId) {
        accessPermissions[employee][recordId] = false;
    }

    function getPayrollRecord(uint256 recordId) public view returns (string memory) {
        require(accessPermissions[msg.sender][recordId], "Not authorized");
        return payrollRecords[recordId].ipfsHash;
    }
}