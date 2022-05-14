//Import Contractconst DStorage = artifacts.require("DStorage");
const DStorage = artifacts.require("Dstorage");

module.exports = function (deployer) {
	deployer.deploy(DStorage);
};
