const Payroll = artifacts.require("Payroll");

module.exports = function(deployer) {
  deployer.deploy(Payroll, {
    gas: 5000000,  // Increase gas limit for deployment
    overwrite: false
  });
};