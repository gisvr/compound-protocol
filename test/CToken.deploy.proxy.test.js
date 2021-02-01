const { accounts, contract, web3, defaultSender } = require("@openzeppelin/test-environment");
let sender = defaultSender;

const {
    BN,          // Big Number support
    constants,    // Common constants, like the zero address and largest integers
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
    time
} = require("@openzeppelin/test-helpers");

const { expect } = require("chai");

const CToken = contract.fromArtifact("CToken"); // Loads a compiled contract
const MockDAI = contract.fromArtifact("MockDAI");
const MockUSDC = contract.fromArtifact("MockUSDC");
const MockBAT = contract.fromArtifact("MockBAT");
const MockWBTC = contract.fromArtifact("MockWBTC");

const CErc20 = contract.fromArtifact("CErc20Immutable");

const Comp = contract.fromArtifact("Comp");

// const Comptroller = contract.fromArtifact("Comptroller");
const Comptroller = contract.fromArtifact("ComptrollerG4");
const Unitroller = contract.fromArtifact("Unitroller");

const JumpRateModel = contract.fromArtifact("JumpRateModel");
const WhitePaperInterestRateModel = contract.fromArtifact("WhitePaperInterestRateModel");
// const InterestRateModel = contract.fromArtifact("InterestRateModel");

const SimplePriceOracle = contract.fromArtifact("SimplePriceOracle");


const CErc20Delegate = contract.fromArtifact("CErc20Delegate");
const CErc20Delegator = contract.fromArtifact("CErc20Delegator");

let ethDecimalsBN = (new BN(10)).pow(new BN(18));

let cTokenMint = async (cToken, amount, account) => {
    await cToken.mint(amount, { from: account });

    // console.log(tx.logs)

    let totalSupply = await cToken.totalSupply()
    let totalBorrows = await cToken.totalBorrowsCurrent();
    for (let log of totalBorrows.logs) {
        if (log.event == "AccrueInterest") {
            // emit AccrueInterest(cashPrior, interestAccumulated, borrowIndexNew, totalBorrowsNew);
            let cashPrior = log.args[0].toString()
            let interestAccumulated = log.args[1].toString()
            let borrowIndexNew = log.args[2].toString()
            let totalBorrowsNew = log.args[3].toString()
            console.log(`totalSupply ${totalSupply} , cashPrior ${cashPrior}, interestAccumulated ${interestAccumulated},
                borrowIndexNew ${borrowIndexNew}, totalBorrowsNew ${totalBorrowsNew}`)
        }
    }
}

describe("CToken", function () {
    const [alice, bob, minter] = accounts;
    before(async () => {

        let tokens = [MockDAI, MockUSDC, MockBAT, MockWBTC];
        let tokenList = [];
        for (let erc20Token of tokens) {
            let total = new BN(20000)
            let mock = await erc20Token.new();
            let symbol = await mock.symbol()
            let name = await mock.name()
            let decimal = await mock.decimals()
            total = total.mul(new BN(10).pow(decimal))
            console.log(`symbol ${symbol.toString()},decimal ${decimal.toString()},total ${total.toString()}`)
            await mock.mint(total)
            await mock.mint(total, { from: alice })
            await mock.mint(total, { from: bob })

            tokenList.push({
                symbol: symbol,
                name: name,
                address: mock.address,
                decimal: decimal
            })
            this[symbol] = mock;
        }

        this.Comp = await Comp.new(alice);
        let comptroller = await Comptroller.new(this.Comp.address); //this.Comp.address
        //  Unitroller
        let unitroller = await Unitroller.new()
        let ctlAddr = unitroller.address
        await unitroller._setPendingImplementation(comptroller.address)

        await comptroller._become(ctlAddr);


        this.Ctl = await Comptroller.at(ctlAddr);

        let newLiquidationIncentiveMantissa = 1.05e18.toString()
        await this.Ctl._setLiquidationIncentive(newLiquidationIncentiveMantissa)


        let baseRate_ = 0.05e18.toString(); //APY
        let multiplier_ = 0.12e18.toString(); //APY
        let whitePaperInterestRateModel = await WhitePaperInterestRateModel.new(baseRate_, multiplier_)
        let interestRateModel = whitePaperInterestRateModel.address
        let admin = sender;

        for (let token of tokenList) {
            let underlying = token.address;

            // 1 Create PriceOracle
            let simplePriceOracle = await SimplePriceOracle.new()
            await simplePriceOracle.setDirectPrice(underlying, ethDecimalsBN.div(new BN(10)));
            let _oracle = simplePriceOracle.address;
            let _closeFactorMantissa = 0.5e18.toString();
            let _maxAssets = 20
            let reinitializing = false;



            let initialExchangeRateMantissa = "200000000000000000000000000" //2e26
            let name = "C" + token.name;
            let symbol = "c" + token.symbol;
            let decimals = token.decimal;
            let cErc20 = await CErc20.new(underlying, ctlAddr, interestRateModel, initialExchangeRateMantissa, name, symbol, decimals, admin);

            let newReserveFactorMantissa = 0.1e18.toString();
            await cErc20._setReserveFactor(newReserveFactorMantissa)

            let cToken = cErc20.address

            // 上架
            await this.Ctl._supportMarket(cToken)

            await this.Ctl._setPriceOracle(simplePriceOracle.address)

            //设置抵押物比例
            let newCollateralFactorMantissa = 0.6e18.toString();
            await this.Ctl._setCollateralFactor(cToken, newCollateralFactorMantissa)

            await cErc20._setPendingAdmin(admin);

            this[symbol] = cErc20;

            //  approve
            await this[token.symbol].approve(cToken, amount)

            await cTokenMint(cDAI, amount, sender);

        }


    });
    it("Mint sender DAI alice USDC", async () => {
        let DAI = this.DAI;
        let cDAI = this.cDAI;
        let cDAIAddr = cDAI.address

        let balance1 = await DAI.balanceOf(sender);
        let daiAmount = balance1.div(new BN(2))
        console.log("Mint DAI", daiAmount.toString())
        await DAI.approve(cDAIAddr, daiAmount)

        await cTokenMint(cDAI, daiAmount, sender);

        let USDC = this.USDC;
        let cUSDC = this.cUSDC;
        let cUSDCAddr = cUSDC.address
        let usdcBal = await USDC.balanceOf(alice);
        let usdcAmount = usdcBal.div(new BN(2))
        console.log("Mint USDC", usdcAmount.toString())
        await USDC.approve(cUSDCAddr, usdcAmount, { from: alice })

        await cTokenMint(cUSDC, usdcAmount, alice);

        let balSnapshot = await cDAI.getAccountSnapshot(sender);
        // return (uint(Error.NO_ERROR), cTokenBalance, borrowBalance, exchangeRateMantissa); 
        // expect(balSnapshot[1]).to.be.bignumber.equal(amount.mul(ethDecimalsBN))

    });

    it.skip("Redeem sender", async () => {

        let reserve = this.DAI;
        let cAddr = this.CErc20.address
        let balance1 = await reserve.balanceOf(sender);

        let balSnapshot1 = await this.CErc20.getAccountSnapshot(sender);

        let amount = this.value.div(new BN(60));
        let rate = await this.CErc20.exchangeRateStored()
        let _amount = amount.mul(ethDecimalsBN).div(rate);
        let tx = await this.CErc20.redeem(_amount, { from: sender });
        let balance2 = await reserve.balanceOf(sender);

        let balSnapshot2 = await this.CErc20.getAccountSnapshot(sender);

        // expect(balance2).to.be.bignumber.equal(balance1.add(amount))

        // expect(balSnapshot1[1]).to.be.bignumber.equal(balSnapshot2[1].sub(amount))

    });

    it("Borrow alice", async () => {
        let DAI = this.DAI;
        let cDAI = this.cDAI;
        let cDaiAddr = cDAI.address

        // let daiAmount = await DAI.balanceOf(sender);
        let daiAmount = new BN("500000000000") //daiAmount.div(new BN(2))

        // let balSnapshot1 = await this.CErc20.getAccountSnapshot(alice); 
        let rate = await cDAI.exchangeRateStored()
        let _amount = daiAmount.div(rate);
        let tx = await cDAI.borrow(_amount, { from: alice });
        // console.log(tx.logs) 
        //borrowFresh  return failOpaque(Error.COMPTROLLER_REJECTION, FailureInfo.BORROW_COMPTROLLER_REJECTION, allowed);
        let errorLog = tx.logs[1].args;
        console.log("error %s info %s detail %s",
            errorLog.error.toString(), // 3 ComptrollerErrorReporter.ERROR.INSUFFICIENT_SHORTFALL ->comptroller.borrowAllowed 
            errorLog.info.toString(),  // 14 TokenErrorReporter.BORROW_COMPTROLLER_REJECTION -> borrowFresh
            errorLog.detail.toString()) //16 ComptrollerErrorReporter. MARKET_NOT_LISTED -> mintAllowed  


        let foo = await cDAI.supplyRatePerBlock()
        console.log("supplyRatePerBlock cDAI", foo.toString())


        // let balance2 = await reserve.balanceOf(alice);
        //    expect(balance2).to.be.bignumber.equal(balance1.add(amount),"borrow")

    });

    it.skip("Repay Borrow alice", async () => {
        let blockNumAfter = await time.latestBlock()
        console.log('blockNumAfter:%s ', blockNumAfter)

        await time.advanceBlockTo(200)

        let blockNumBefore = await time.latestBlock()
        console.log('blockNumBefore:%s ', blockNumBefore)

        let reserve = this.MockDAI;
        let cAddr = this.CErc20.address
        let amount = this.value.div(new BN(2));
        let balance1 = await reserve.balanceOf(alice);
        await reserve.approve(cAddr, amount, { from: alice })

        let tx = await this.CErc20.repayBorrow(amount, { from: alice });
        let balance2 = await reserve.balanceOf(alice);

        let balSnapshot = await this.CErc20.getAccountSnapshot(alice);
        // for (let id in balSnapshot) {
        //     console.log(balSnapshot[id].toString())
        // }
    });


    it("should have correct name and symbol and decimal", async () => {
        let underlying = await this.cDAI.underlying();
        let name = await this.cDAI.name();
        let bal = await this.cDAI.balanceOf(sender);
        console.log(underlying, name, bal.toString())
        // expect(await this.DAI.totalSupply()).to.be.bignumber.equal(this.value.mul(new BN(2)), "mock token mint");
    });


});


