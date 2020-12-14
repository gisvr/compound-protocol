const {accounts, contract, web3} = require("@openzeppelin/test-environment");
const {
    BN,          // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

const {expect} = require("chai");

const CToken = contract.fromArtifact("CToken"); // Loads a compiled contract
const MockDAI = contract.fromArtifact("MockDAI");

const CErc20 = contract.fromArtifact("CErc20Immutable");

const Comptroller = contract.fromArtifact("Comptroller");
const JumpRateModel = contract.fromArtifact("JumpRateModel");


describe("CToken", function () {
    const [alice, bob, carol, minter] = accounts;
    before(async () => {
        this.value = new BN(60000000);

        this.Comptroller = await Comptroller.new();

        this.MockDAI = await MockDAI.new();

        this.MockDAI.mint(2000*1e22)

        //(uint baseRatePerYear, uint multiplierPerYear, uint jumpMultiplierPerYear, uint kink_)
        this.JumpRateModel = await JumpRateModel.new(1,1,1,1);

        //     address underlying_,
        //     ComptrollerInterface comptroller_,
        //     InterestRateModel interestRateModel_,
        //     uint initialExchangeRateMantissa_,
        //     string memory name_,
        //     string memory symbol_,
        //     uint8 decimals_,
        //     address payable admin_,

        this.CErc20 = await CErc20.new(this.MockDAI.address,
            this.Comptroller.address,
            this.JumpRateModel.address,
            1,
            "MC name",
            "MC",
            18,
            alice );

    });

    it("compund mint", async () => {
        let tx = await this.CErc20.mint(1);
        console.log(tx)
    });

    it("should have correct name and symbol and decimal", async () => {
        let underlying = await this.CErc20.underlying();
        let name = await this.CErc20.name();
        console.log(underlying,name)

        // expect(await this.mockERC20.totalSupply()).to.be.bignumber.equal(this.value);
    });


});


