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
        this.value = new BN(60000000);
        // MockDAI
        this.MockDAI = await MockDAI.new();
        this.MockDAI.mint(this.value)
        this.MockDAI.mint(this.value, { from: alice })

        this.Comptroller = await Comptroller.new();
        //(uint baseRatePerYear, uint multiplierPerYear, uint jumpMultiplierPerYear, uint kink_)
        this.JumpRateModel = await JumpRateModel.new(1, 1, 1, 1);

        // let interestRateModel =  await  InterestRateModel.new(1);

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

        // let cDelegatee = await new CErc20Delegate();
        // console.log(cDelegatee.address)
        // let cDelegator = await new CErc20Delegator(
        //     this.MockDAI.address,
        //     this.Comptroller.address,
        //     this.JumpRateModel.address,
        //     1e18.toString(), //exchangeRate
        //     "CToken name",
        //     "cDAI",
        //     "18",
        //     sender,
        //     cDelegatee._address,
        //     "0x0"
        // );
        // let cToken = await saddle.getContractAt('CErc20DelegateHarness', cDelegator._address);

        // let cToken = await CErc20Delegate.at(cDelegator._address)

        // 加入市场
        await this.Comptroller.enterMarkets([this.CErc20.address])
        // 上架
        await this.Comptroller._supportMarket(this.CErc20.address)

    });

    it("Mint accrueInterest", async () => {
        let tx = await this.CErc20.accrueInterest();

        // event AccrueInterest(uint cashPrior, uint interestAccumulated, uint borrowIndex, uint totalBorrows);
        await expectEvent.inTransaction(tx.tx, CToken, "AccrueInterest", { cashPrior: new BN("0") })

        // function mintAllowed(address cToken, address minter, uint mintAmount) external returns (uint);
        let mintTx = await this.Comptroller.mintAllowed(this.CErc20.address, sender, "10000")

        // console.log(mintTx)

        // let trx =await web3.eth.getTransaction(tx.tx); 
        // let receipt =await web3.eth.getTransactionReceipt(tx.tx);


    });

    it("Mint", async () => {

        let tx = await this.CErc20.mint("10000", { from: sender });

        // event Failure(uint error, uint info, uint detail);  
        //mintFresh => failOpaque(Error.COMPTROLLER_REJECTION, FailureInfo.MINT_COMPTROLLER_REJECTION, allowed) //INSUFFICIENT_SHORTFALL
        console.log(tx.logs[1].args.error.toString())  //3 TokenErrorReporter.COMPTROLLER_REJECTION ->liquidateBorrowAllowed 
        console.log(tx.logs[1].args.info.toString())   //31 TokenErrorReporter.MINT_COMPTROLLER_REJECTION -> mintFresh
        console.log(tx.logs[1].args.detail.toString()) //9 ComptrollerErrorReporter. MARKET_NOT_LISTED -> mintAllowed 


        // emit Transfer(address(this), minter, vars.mintTokens);
        // await expectEvent(tx, 'Mint', { minter: sender});    

        // event AccrueInterest(uint cashPrior, uint interestAccumulated, uint borrowIndex, uint totalBorrows);
        await expectEvent.inTransaction(tx.tx, CToken, "AccrueInterest", { cashPrior: new BN("0") })

        // event Failure(uint error, uint info, uint detail);
        // await expectEvent.inTransaction(tx.tx, CToken, "Failure",{ info: new BN("0")})

        // event Mint(address minter, uint mintAmount, uint mintTokens);
        // await expectEvent.inTransaction(tx.tx, CToken, "Mint",{ minter: sender})

        let balSnapshot = await this.CErc20.getAccountSnapshot(sender);
        for (let id in balSnapshot) {
            // console.log(balSnapshot[id].toString())
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


