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

let ethDecimalsBN = (new BN(10)).pow(new BN(18));

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
    it("Mint sender alice", async () => {
        let reserve = this.MockDAI;
        let cAddr = this.CErc20.address
        
        let amount = this.value.div(new BN(50));
        let balance1 = await reserve.balanceOf(sender); 
        await reserve.approve(cAddr, amount)
        let tx = await this.CErc20.mint(amount, { from: sender }); 

        await reserve.approve(cAddr, amount, { from: alice })
        let tx1 = await this.CErc20.mint(amount, { from: alice }); 
        let balance2 = await reserve.balanceOf(sender); 

        let balSnapshot = await this.CErc20.getAccountSnapshot(sender);
         // return (uint(Error.NO_ERROR), cTokenBalance, borrowBalance, exchangeRateMantissa); 
         expect(balSnapshot[1]).to.be.bignumber.equal(amount.mul(ethDecimalsBN))
 
    });

    it("Redeem sender", async () => {
        let reserve = this.MockDAI;
        let cAddr = this.CErc20.address 
        let balance1 = await reserve.balanceOf(sender); 

        let balSnapshot1 = await this.CErc20.getAccountSnapshot(sender);

        let amount = this.value.div(new BN(60));
        let rate = await this.CErc20.exchangeRateStored()
        let _amount = amount.mul(ethDecimalsBN).div(rate); 
        let tx = await this.CErc20.redeem(_amount, { from: sender }); 
        let balance2 = await reserve.balanceOf(sender); 

        let balSnapshot2 = await this.CErc20.getAccountSnapshot(sender);

        expect(balance2).to.be.bignumber.equal(balance1.add(amount))

        // expect(balSnapshot1[1]).to.be.bignumber.equal(balSnapshot2[1].sub(amount))
        
    });

    it("Borrow alice", async () => {
        let reserve = this.MockDAI;
        let cAddr = this.CErc20.address 
        let balance1 = await reserve.balanceOf(alice); 

        let balSnapshot1 = await this.CErc20.getAccountSnapshot(alice);
        let amount = this.value.div(new BN(600));

        let rate = await this.CErc20.exchangeRateStored()
        let _amount = amount.mul(ethDecimalsBN).div(rate); 
        let tx = await this.CErc20.borrow(_amount, { from: alice }); 
        console.log(tx.logs)
        let balance2 = await reserve.balanceOf(alice); 
 
        expect(balance2).to.be.bignumber.equal(balance1.add(amount))

 
    });

    it.skip("Repay Borrow alice", async () => {
        let reserve = this.MockDAI;
        let cAddr = this.CErc20.address 
        let balance1 = await reserve.balanceOf(alice); 
        let tx = await this.CErc20.repayBorrow("100", { from: alice }); 
        let balance2 = await reserve.balanceOf(alice); 

        let balSnapshot = await this.CErc20.getAccountSnapshot(alice);
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


