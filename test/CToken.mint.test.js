const { accounts, contract, web3, defaultSender } = require("@openzeppelin/test-environment");
let sender = defaultSender;

const {
    BN,          // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

const { expect } = require("chai");

const CToken = contract.fromArtifact("CToken"); // Loads a compiled contract
const MockDAI = contract.fromArtifact("MockDAI");

const CErc20 = contract.fromArtifact("CErc20Immutable");

const Comptroller = contract.fromArtifact("Comptroller");
const JumpRateModel = contract.fromArtifact("JumpRateModel");
// const InterestRateModel = contract.fromArtifact("InterestRateModel");

const CErc20Delegate = contract.fromArtifact("CErc20Delegate");
const CErc20Delegator = contract.fromArtifact("CErc20Delegator");



describe("CToken", function () {
    const [alice, bob, minter] = accounts;
    before(async () => {
        this.value = (new BN(10)).pow(new BN(18));

        // MockDAI
        this.MockDAI = await MockDAI.new();
        this.MockDAI.mint(this.value)
        this.MockDAI.mint(this.value, { from: alice })

        this.Comptroller = await Comptroller.new();
        //(uint baseRatePerYear, uint multiplierPerYear, uint jumpMultiplierPerYear, uint kink_)
        this.JumpRateModel = await JumpRateModel.new(1, 1, 1, 1); 
        this.CErc20 = await CErc20.new(
            this.MockDAI.address,//    underlying_,
            this.Comptroller.address, //  ComptrollerInterface comptroller_,
            this.JumpRateModel.address,   //     InterestRateModel interestRateModel_,
            1, //    uint initialExchangeRateMantissa_,
            "MC name", //  string memory name_,
            "MC", //   string memory symbol_,
            18,  //     uint8 decimals_,
            sender  //     address payable admin_, 
        );

        // 加入市场
        await this.Comptroller.enterMarkets([this.CErc20.address])
        // 上架
        await this.Comptroller._supportMarket(this.CErc20.address)

    });
    it("Mint", async () => {
        let reserve = this.MockDAI;
        let cAddr = this.CErc20.address
        await reserve.approve(cAddr, this.value)
        let balance1 = await reserve.balanceOf(sender);
        // await reserve.transfer(cAddr, amount); 
        let tx = await this.CErc20.mint(this.value.div(new BN(50)), { from: sender });

        let balance2 = await reserve.balanceOf(sender);
 
        let balSnapshot = await this.CErc20.getAccountSnapshot(sender);
        for (let id in balSnapshot) {
            console.log(balSnapshot[id].toString())
        }
    });

    it("should have correct name and symbol and decimal", async () => {
        let underlying = await this.CErc20.underlying();
        let name = await this.CErc20.name();
        let bal = await this.CErc20.balanceOf(sender);
        console.log(underlying, name, bal.toString())
        expect(await this.MockDAI.totalSupply()).to.be.bignumber.equal(this.value.mul(new BN(2)), "mock token mint");
    });


});


