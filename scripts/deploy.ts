import { ethers } from "hardhat";

async function main() {

  const Permit2 = await ethers.getContractFactory("Permit2");
  const permit2 = await Permit2.deploy();

  await permit2.deployed();

  console.log(`Permit2 deployed to ${permit2.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
