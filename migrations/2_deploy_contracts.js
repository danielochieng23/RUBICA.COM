const DigitalIdentity = artifacts.require("DigitalIdentity");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(DigitalIdentity).then(() => {
    console.log("DigitalIdentity contract deployed at:", DigitalIdentity.address);
    console.log("Contract deployed by:", accounts[0]);
  });
};