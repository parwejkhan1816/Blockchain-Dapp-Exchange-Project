
const { ethers } = require('hardhat');


async function main() {

  const contract =  await ethers.getContractFactory('NFTee');

  const contractdeploy = await contract.deploy();

  await contractdeploy.deployed();

  console.log("NFT Contract Address:", contractdeploy.address);

}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });