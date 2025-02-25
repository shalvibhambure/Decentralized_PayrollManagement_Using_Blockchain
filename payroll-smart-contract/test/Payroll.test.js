const Payroll = artifacts.require("Payroll");

contract("Payroll", (accounts) => {
  let payroll;

  before(async () => {
    payroll = await Payroll.deployed();
  });

  it("should add a payroll record", async () => {
    const recordId = 1;
    const ipfsHash = "QmExampleIPFSHash";
    const employeeAddress = accounts[1];

    await payroll.addPayrollRecord(recordId, ipfsHash, employeeAddress, { from: accounts[0] });

    const record = await payroll.payrollRecords(recordId);
    assert.equal(record.ipfsHash, ipfsHash, "IPFS hash does not match");
    assert.equal(record.employee, employeeAddress, "Employee address does not match");
  });

  it("should grant access to an employee", async () => {
    const recordId = 1;
    const employeeAddress = accounts[1];

    await payroll.grantAccess(recordId, employeeAddress, { from: accounts[0] });

    const hasAccess = await payroll.accessPermissions(employeeAddress, recordId);
    assert.equal(hasAccess, true, "Employee access was not granted");
  });

  it("should fetch a payroll record", async () => {
    const recordId = 1;
    const employeeAddress = accounts[1];

    const ipfsHash = await payroll.getPayrollRecord(recordId, { from: employeeAddress });
    assert.equal(ipfsHash, "QmExampleIPFSHash", "IPFS hash does not match");
  });
});