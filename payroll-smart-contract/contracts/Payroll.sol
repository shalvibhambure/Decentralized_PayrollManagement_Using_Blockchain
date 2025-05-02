// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Payroll {

    struct Admin {
        string email;
        string ipfsHash;
        bool approved;
    }
    struct Employee {
        string email;
        string ipfsHash;
        bool approved;
    }

    address public owner;
    Admin[] public AdminsList;
    Employee[] public EmployeeList;

    uint public AdminIterator = 0;
    uint public EmployeeIterator = 0;

    mapping(address => Admin) public RegisterAdmins;
    mapping(address => Employee) public RegisterEmployees;
    mapping(address => uint) public AdminArrayIndex;
    mapping(address => uint) public EmployeeArrayIndex;

    event AdminRequested(address indexed adminAddress, string email, string ipfsHash);
    event EmployeeRequested(address indexed employeeAddress, string email, string ipfsHash);

    constructor() {
        owner = msg.sender;
    }

    function isOwner(address account) public view returns (bool) {
        return account == owner;
    }

    function registerAdmin(string memory email, string memory ipfsHash) public {
        require(!RegisterAdmins[msg.sender].approved, "Already registered as admin");
        require(bytes(email).length > 0, "Email required");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");

        Admin memory newAdmin = Admin({
            email: email,
            ipfsHash: ipfsHash,
            approved: false
        });
        RegisterAdmins[msg.sender] = newAdmin;

        AdminsList.push(newAdmin);

        AdminArrayIndex[msg.sender] = AdminIterator;
        AdminIterator++;
        emit AdminRequested(msg.sender, email, ipfsHash);
    }

    function registerEmployee(string memory email, string memory ipfsHash) public {
        require(!RegisterEmployees[msg.sender].approved, "Already registered as employee");
        require(bytes(email).length > 0, "Email required");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        
        Employee memory newEmployee = Employee({
            email: email,
            ipfsHash: ipfsHash,
            approved: false
        });
        RegisterEmployees[msg.sender] = newEmployee;

        EmployeeList.push(newEmployee); 
        
        EmployeeArrayIndex[msg.sender] = EmployeeIterator;
        EmployeeIterator++;
        emit EmployeeRequested(msg.sender, email, ipfsHash);
    }

    function approveAdmin(address adminAddress) public {
        require(msg.sender == owner, "Only owner can approve admins");
        require(!RegisterAdmins[adminAddress].approved, "Already approved");
        RegisterAdmins[adminAddress].approved = true;
        AdminsList[AdminArrayIndex[adminAddress]].approved = true;
    }

    function rejectAdmin(address adminAddress) public {
        require(msg.sender == owner, "Only owner can reject admins");
        require(!RegisterAdmins[adminAddress].approved, "Already approved");
        RegisterAdmins[adminAddress].approved = false;
        AdminsList[AdminArrayIndex[adminAddress]].approved = false;
    }

    function approveEmployee(address employeeAddress, string memory newIpfsHash) public {
        require(!RegisterEmployees[employeeAddress].approved, "Already approved");
        RegisterEmployees[employeeAddress].ipfsHash = newIpfsHash; // Update IPFS hash
        RegisterEmployees[employeeAddress].approved = true;
        uint index = EmployeeArrayIndex[employeeAddress];
        EmployeeList[index].ipfsHash = newIpfsHash; 
        EmployeeList[index].approved = true;
    }

    function rejectEmployee(address employeeAddress) public {
        require(!RegisterEmployees[employeeAddress].approved, "Already approved");
        RegisterEmployees[employeeAddress].approved = false;
        EmployeeList[EmployeeArrayIndex[employeeAddress]].approved = false;
    }

    function getPendingAdmins() public view returns (Admin[] memory) {
        uint count = 0;
        for (uint i = 0; i < AdminsList.length; i++) {
            if (!AdminsList[i].approved) {
                count++;
            }
        }
        Admin[] memory pendingAdmins = new Admin[](count);
        uint index = 0; 
        for (uint i = 0; i < AdminsList.length; i++) {
            if (!AdminsList[i].approved) {
                pendingAdmins[index] = AdminsList[i];
                index++;
            }
        }
        return pendingAdmins;
    }

    function getApprovedAdmins() public view returns (Admin[] memory) {
        uint count = 0;
        for (uint i = 0; i < AdminsList.length; i++) {
            if (AdminsList[i].approved) {
                count++;
            }
        }
        Admin[] memory approvedAdmins = new Admin[](count);
        uint index = 0;
        for (uint i = 0; i < AdminsList.length; i++) {
            if (AdminsList[i].approved) {
                approvedAdmins[index] = AdminsList[i];
                index++;
            }
        }
        return approvedAdmins;
    }

    function getAdmin(address adminAddress) public view returns (Admin memory) {
        uint index = AdminArrayIndex[adminAddress];
        require(AdminsList[index].approved, "Admin is not approved");
        return AdminsList[index];
    }

    function getPendingEmployees() public view returns (Employee[] memory) {
        uint count = 0;
        for (uint i = 0; i < EmployeeList.length; i++) {
            if (!EmployeeList[i].approved) {
                count++;
            }
        }
        Employee[] memory pendingEmployees = new Employee[](count);
        uint index = 0;
        for (uint i = 0; i < EmployeeList.length; i++) {
            if (!EmployeeList[i].approved) {
                pendingEmployees[index] = EmployeeList[i];
                index++;
            }
        }
        return pendingEmployees;
    }
    
    function getApprovedEmployees() public view returns (Employee[] memory) {
        uint count = 0;
        for (uint i = 0; i < EmployeeList.length; i++) {
            if (EmployeeList[i].approved) {
                count++;
            }
        }
        Employee[] memory approvedEmployees = new Employee[](count);
        uint index = 0; 
        for (uint i = 0; i < EmployeeList.length; i++) {
            if (EmployeeList[i].approved) {
                approvedEmployees[index] = EmployeeList[i];
                index++;
            }
        }
        return approvedEmployees;
    }
    
    function getEmployee(address employeeAddress) public view returns (Employee memory) {
        uint index = EmployeeArrayIndex[employeeAddress];
        require(EmployeeList[index].approved, "Employee is not approved");
        return EmployeeList[index];
    }






    /*address public owner;
    address[] public pendingAdmins;
    address[] public pendingEmployees;
    address[] public approvedEmployees;
    address[] public approvedAdmins;
    uint256 public constant TAX_RATE = 20;
    uint256 public constant NI_RATE = 12;
    
    // Existing structures
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
        string name;
        uint256 employeeId;
        string email;
        string ipfsHash;
        bool approved;
        bool exists; // New flag to check if request exists
    }

    struct SalaryRecord {
        uint256 grossAmount;
        uint256 taxAmount;
        uint256 niAmount;
        uint256 netAmount;
        uint256 timestamp;
        bool paid;
    }

    struct Payslip {
        string ipfsHash;
        bool generated;
    }

    struct TaxSlab {
        uint256 min;
        uint256 max;
        uint256 rate;
    }

    // New structures for enhanced functionality
    struct EmployeeOnChainData {
        string fullName;
        uint256 employeeId;
        string email;
        uint256 annualSalary;
        uint256 monthlySalary;
        uint256 taxAmount;
        uint256 niAmount;
        uint256 netSalary;
        uint256 startDate;
    }

    // Existing mappings
    mapping(address => bool) public admins;
    mapping(address => string) public adminNames;
    mapping(address => uint256) public adminEmployeeIds;
    mapping(address => string) public adminEmails;
    mapping(uint256 => PayrollRecord) public payrollRecords;
    mapping(address => mapping(uint256 => bool)) public accessPermissions;
    mapping(address => AdminRequest) public adminRequests;
    mapping(address => EmployeeRequest) public employeeRequests;
    mapping(address => string) public employeeDataHashes;
    mapping(address => mapping(uint256 => SalaryRecord)) public employeeSalaries;
    mapping(address => mapping(uint256 => Payslip)) public payslips;
    mapping(address => uint256[]) public employeeSalaryMonths;
    TaxSlab[] public taxSlabs;

    // New mappings
    mapping(address => EmployeeOnChainData) public employeeOnChainData;

    // Events
    event EmployeeRegistered( address indexed employee, string fullName, uint256 employeeId, string email);
    event EmployeeApproved(address indexed employee, uint256 annualSalary, string ipfsHash);
    event EmployeeRejected(address indexed employee);
    event AdminRequested(address indexed adminAddress, string name, uint256 employeeId, string email);
    event AdminApproved(address indexed adminAddress);
    event AdminRejected(address indexed adminAddress);
    event SalaryAdded(address indexed employee, uint256 yearMonth, uint256 netAmount);
    event PayslipGenerated(address indexed employee, uint256 yearMonth, string ipfsHash);
    event PayrollRecordAdded(uint256 indexed recordId, address indexed employee);
    event AccessGranted(uint256 indexed recordId, address indexed employee);
    event AccessRevoked(uint256 indexed recordId, address indexed employee);
    event SalaryUpdated(address indexed employee, uint256 newAnnualSalary);

    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        taxSlabs.push(TaxSlab(0, 1000 ether, 10));
        taxSlabs.push(TaxSlab(1000 ether, 5000 ether, 20));
        taxSlabs.push(TaxSlab(5000 ether, type(uint256).max, 30));
    }

    // Admin Functions
    function verifyOwner(address _address) external view returns (bool) {
        return _address == owner;
    }

    function requestAdminRole(string memory _name, uint256 _employeeId, string memory _email) external {
        require(!admins[msg.sender], "Already an admin");
        require(bytes(_name).length > 0, "Name required");
        require(_employeeId > 0, "Invalid employee ID");
        require(bytes(_email).length > 0, "Email required");

        adminRequests[msg.sender] = AdminRequest({
            name: _name,
            employeeId: _employeeId,
            email: _email,
            approved: false
        });

        pendingAdmins.push(msg.sender);
        emit AdminRequested(msg.sender, _name, _employeeId, _email);
    }

    function approveAdmin(address _adminAddress) external onlyOwner {
        require(!adminRequests[_adminAddress].approved, "Already approved");
        
        admins[_adminAddress] = true;
        adminNames[_adminAddress] = adminRequests[_adminAddress].name;
        adminEmployeeIds[_adminAddress] = adminRequests[_adminAddress].employeeId;
        adminEmails[_adminAddress] = adminRequests[_adminAddress].email;
        adminRequests[_adminAddress].approved = true;

        _removeFromPendingAdmins(_adminAddress);
        approvedAdmins.push(_adminAddress);
        emit AdminApproved(_adminAddress);
    }

    function rejectAdmin(address _adminAddress) external onlyOwner {
        require(!adminRequests[_adminAddress].approved, "Already approved");
        _removeFromPendingAdmins(_adminAddress);
        delete adminRequests[_adminAddress];
        emit AdminRejected(_adminAddress);
    }

    // Employee Functions
    function registerEmployee(
        string memory _fullName,
        uint256 _employeeId,
        string memory _email,
        string memory _ipfsHash
    ) external {
        require(!employeeRequests[msg.sender].exists, "Already registered");
        require(bytes(_fullName).length > 0, "Name required");
        require(_employeeId > 0, "Invalid employee ID");
        require(bytes(_email).length > 0, "Email required");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");

        employeeRequests[msg.sender] = EmployeeRequest({
            name: _fullName,
            employeeId: _employeeId,
            email: _email,
            ipfsHash: _ipfsHash,
            approved: false,
            exists: true
        });

        pendingEmployees.push(msg.sender);
        // Emit all relevant data
        emit EmployeeRegistered(msg.sender,_fullName,_employeeId,_email);
    }

    function approveEmployee(
    address employee,
    uint256 annualSalary,
    string calldata updatedIpfsHash  // Add this parameter
) external onlyAdmin {
    require(!employeeRequests[employee].approved, "Already approved");
    
    (uint256 monthly, uint256 tax, uint256 ni, uint256 net) = calculateSalaryComponents(annualSalary);
    
    EmployeeOnChainData storage data = employeeOnChainData[employee];
    data.annualSalary = annualSalary;
    data.monthlySalary = monthly;
    data.taxAmount = tax;
    data.niAmount = ni;
    data.netSalary = net;
    data.startDate = block.timestamp;

    // Update the IPFS hash in the employee request
    employeeRequests[employee].ipfsHash = updatedIpfsHash;
    employeeRequests[employee].approved = true;
    
    approvedEmployees.push(employee);
    _removeFromPendingEmployees(employee);
    
    emit EmployeeApproved(employee, annualSalary, updatedIpfsHash);
}

    function rejectEmployee(address employee) external onlyAdmin {
        require(!employeeRequests[employee].approved, "Already approved");
        _removeFromPendingEmployees(employee);
        delete employeeRequests[employee];
        emit EmployeeRejected(employee);
    }

    function updateEmployeeIPFSHash(address employee, string memory ipfsHash) public onlyAdmin {
        employeeRequests[employee].ipfsHash = ipfsHash;
        emit EmployeeApproved(employee, employeeOnChainData[employee].annualSalary, ipfsHash); // Emit updated event
    }

    function calculateSalaryComponents(uint256 annualSalary) public pure returns (
        uint256 monthly,
        uint256 tax,
        uint256 ni,
        uint256 net
    ) {
        monthly = annualSalary / 12;
        tax = (monthly * TAX_RATE) / 100;
        ni = (monthly * NI_RATE) / 100;
        net = monthly - tax - ni;
        return (monthly, tax, ni, net);
    }

    function getEmployeeSalaryDetails(address employee) public view returns (
        uint256 annual,
        uint256 monthly,
        uint256 tax,
        uint256 ni,
        uint256 net
    ) {
        EmployeeOnChainData memory data = employeeOnChainData[employee];
        return (
            data.annualSalary,
            data.monthlySalary,
            data.taxAmount,
            data.niAmount,
            data.netSalary
        );
    }

    // Payroll Functions
    function addSalary(
        address employee,
        uint256 yearMonth,
        uint256 grossSalary
    ) external onlyAdmin {
        require(!employeeSalaries[employee][yearMonth].paid, "Salary exists");
        require(grossSalary > 0, "Invalid salary amount");

        uint256 tax = calculateTax(grossSalary);
        uint256 ni = (grossSalary * NI_RATE) / 100;
        uint256 netSalary = grossSalary - tax - ni;

        employeeSalaries[employee][yearMonth] = SalaryRecord({
            grossAmount: grossSalary,
            taxAmount: tax,
            niAmount: ni,
            netAmount: netSalary,
            timestamp: block.timestamp,
            paid: true
        });

        employeeSalaryMonths[employee].push(yearMonth);
        emit SalaryAdded(employee, yearMonth, netSalary);
    }

    function setPayslipCID(
        address employee,
        uint256 yearMonth,
        string calldata ipfsHash
    ) external onlyAdmin {
        require(employeeSalaries[employee][yearMonth].timestamp != 0, "Salary not found");
        payslips[employee][yearMonth] = Payslip(ipfsHash, true);
        emit PayslipGenerated(employee, yearMonth, ipfsHash);
    }

    // Helper Functions
    function calculateTax(uint256 grossSalary) public view returns (uint256) {
        for (uint i = 0; i < taxSlabs.length; i++) {
            if (grossSalary >= taxSlabs[i].min && grossSalary < taxSlabs[i].max) {
                return (grossSalary * taxSlabs[i].rate) / 100;
            }
        }
        return 0;
    }

    function addPayrollRecord(uint256 recordId, string memory ipfsHash, address employee) public onlyAdmin {
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        require(employee != address(0), "Invalid employee address");
        
        payrollRecords[recordId] = PayrollRecord(ipfsHash, employee, msg.sender);
        emit PayrollRecordAdded(recordId, employee);
    }

    function grantAccess(uint256 recordId, address employee) public {
        require(payrollRecords[recordId].employer == msg.sender, "Not employer");
        emit AccessGranted(recordId, employee);
    }

    function revokeAccess(uint256 recordId, address employee) public {
        require(payrollRecords[recordId].employer == msg.sender, "Not employer");
        accessPermissions[employee][recordId] = false;
        emit AccessRevoked(recordId, employee);
    }

    // Private Functions
    function _removeFromPendingAdmins(address _adminAddress) private {
        for (uint i = 0; i < pendingAdmins.length; i++) {
            if (pendingAdmins[i] == _adminAddress) {
                pendingAdmins[i] = pendingAdmins[pendingAdmins.length - 1];
                pendingAdmins.pop();
                break;
            }
        }
    }

    function _removeFromPendingEmployees(address employee) private {
        for (uint i = 0; i < pendingEmployees.length; i++) {
            if (pendingEmployees[i] == employee) {
                pendingEmployees[i] = pendingEmployees[pendingEmployees.length - 1];
                pendingEmployees.pop();
                break;
            }
        }
    }

    // View Functions
    function isAdmin(address _address) external view returns (bool) {
        return admins[_address];
    }

    function getPendingAdmins() external view returns (address[] memory) {
        return pendingAdmins;
    }

    function getApprovedAdmins() external view returns (address[] memory) {
        return approvedAdmins;
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

    function getSalaryMonths(address employee) external view returns (uint256[] memory) {
        return employeeSalaryMonths[employee];
    }

    function getPayrollRecord(uint256 recordId) public view returns (string memory) {
        require(accessPermissions[msg.sender][recordId], "Not authorized");
        return payrollRecords[recordId].ipfsHash;
    }*/
}