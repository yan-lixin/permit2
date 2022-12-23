import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const TOTAL_SUPPLY = 2_000_000_000;

describe("Permit2", function () {

    async function deployPermit2Fixture() {
        const [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        const Permit2 = await ethers.getContractFactory("Permit2");
        const permit2 = await Permit2.deploy();
        console.log("Permit2 contract address: ", permit2.address);

        const LockUSDT = await ethers.getContractFactory("LockUSDT");
        const lockUSDT = await LockUSDT.deploy();
        console.log("LockUSDT contract address: ", lockUSDT.address);

        const UsdtToken = await ethers.getContractFactory("MyToken");
        const usdtToken = await UsdtToken.deploy();
        usdtToken.initialize("Tether USDT", "USDT", TOTAL_SUPPLY, 6);
        console.log("USDT contract address: ", usdtToken.address);

        const UsdcToken = await ethers.getContractFactory("MyToken");
        const usdcToken = await UsdcToken.deploy();
        usdcToken.initialize("USD Coin", "USDC", TOTAL_SUPPLY, 18);
        console.log("USDC contract address: ", usdcToken.address);

        const DaiToken = await ethers.getContractFactory("MyToken");
        const daiToken = await DaiToken.deploy();
        usdcToken.initialize("DAI", "DAI", TOTAL_SUPPLY, 18);
        console.log("DAI contract address: ", daiToken.address);

        return { owner, addr1, addr2, permit2, usdtToken, usdcToken, lockUSDT };
    }

    it("permit transfer from", async () => {
        const { owner, lockUSDT, usdtToken } = await loadFixture(deployPermit2Fixture);
        const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
        const chainId = (await provider.getNetwork()).chainId;
        const PERMIT2_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
        const domain = {
            name: 'Permit2',
            chainId: chainId,
            verifyingContract: PERMIT2_ADDRESS,
        };

        const types = {
            PermitTransferFrom: [
                { name: 'permitted', type: 'TokenPermissions' },
                { name: 'spender', type: 'address' },
                { name: 'nonce', type: 'uint256' },
                { name: 'deadline', type: 'uint256' }
            ],
            TokenPermissions: [
                { name: 'token', type: 'address' },
                { name: 'amount', type: 'uint256' },
            ],
        };

        const message = {
            permitted: {
                token: usdtToken.address,
                amount: 200
            },
            spender: lockUSDT.address,
            nonce: 0,
            deadline: 1671960547
        };

        let transferDetails = {
            "to": lockUSDT.address,
            "requestedAmount": 200
        }

        const signature = await owner._signTypedData(
            domain,
            types,
            message
        )
        let signParts = ethers.utils.splitSignature(signature);
        console.log(">>> Signature:", signParts);
        console.log(signature);

        const expectedSignerAddress = owner.address;
        const recoveredAddress = ethers.utils.verifyTypedData(domain, types, message, signature);
        expect(expectedSignerAddress).to.equal(recoveredAddress);

        usdtToken.approve(PERMIT2_ADDRESS, 1000);
        await lockUSDT.lock(PERMIT2_ADDRESS, message, transferDetails, owner.address, signature);

        console.log("Owner USDT balance: ", await usdtToken.balanceOf(owner.address));
        console.log("Lock USDT Contract balance: ", await usdtToken.balanceOf(lockUSDT.address));
        console.log("Permit2 Contract USDT allowance: ", await usdtToken.allowance(owner.address, PERMIT2_ADDRESS));
    });

});