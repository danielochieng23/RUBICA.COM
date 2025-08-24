const IdentityRegistry = artifacts.require("IdentityRegistry");
const ZKVerifier = artifacts.require("ZKVerifier");

module.exports = async function (deployer, network, accounts) {
  // Deploy ZKVerifier first
  await deployer.deploy(ZKVerifier);
  const zkVerifier = await ZKVerifier.deployed();

  // Deploy IdentityRegistry
  await deployer.deploy(IdentityRegistry);
  const identityRegistry = await IdentityRegistry.deployed();

  console.log("ZKVerifier deployed at:", zkVerifier.address);
  console.log("IdentityRegistry deployed at:", identityRegistry.address);

  // Add initial trusted issuers (for demo purposes)
  if (network === 'development') {
    await identityRegistry.addTrustedIssuer(accounts[1]);
    await identityRegistry.addTrustedIssuer(accounts[2]);
    console.log("Added trusted issuers:", accounts[1], accounts[2]);
  }
};