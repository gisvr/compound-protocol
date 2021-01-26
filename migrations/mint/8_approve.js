
const MockDAI = artifacts.require("MockDAI");

const CErc20 = artifacts.require("CErc20Immutable");

const CEther = artifacts.require("CEther")

const Comptroller = artifacts.require("Comptroller");
const JumpRateModel = artifacts.require("JumpRateModel");
let BN = web3.utils.BN;

 
module.exports = async (deployer, network, accounts) => {
    let [sender, alice] = accounts;
    let amount = 1e20.toString();

    let comptroller = await Comptroller.deployed();
    const cTokens = await comptroller.getAllMarkets();
    for (let addr of cTokens) {
        let cToken = await CErc20.at(addr)
        let cSymbol = await cToken.symbol()

        if (cSymbol == "cETH") {
            let cETH = await CEther.at(addr)
            let ethAmount = 2e18.toString();
            let ethRec1 = await cETH.mint({ from: sender, value: ethAmount });
            console.log("ETH mint", ethRec1.tx)

            let ethBorrowAmount = 1e18.toString()
            let ethRec2 = await cETH.borrow(ethBorrowAmount, { from: sender });
            console.log("ETH borrow", ethRec2.tx)

            let ethRedeemAmount = 1e17.toString()
            let ethRec3 = await cETH.redeem(ethRedeemAmount, { from: sender });
            console.log("ETH redeem", ethRec3.tx)

            continue;
        }

        let underlying = await cToken.underlying()
        console.log("symbol %s, addr %s , underlying: %s", cSymbol, cToken.address, underlying);

        // console.log(underlying);
        let erc20Token = await MockDAI.at(underlying);
        erc20Token.mint(amount)
        erc20Token.mint(amount, { from: alice })
        await erc20Token.approve(cToken.address, amount)
        let rec1 = await cToken.mint(amount, { from: sender });
        console.log("mint", rec1.tx)


        let borrowAmount = 5e18.toString()
        let rec2 = await cToken.borrow(borrowAmount, { from: sender });
        console.log("borrow", rec2.tx)

        let rate = await cToken.exchangeRateStored();
        let redeemAmount = new BN(1e18.toString()).div(rate);
        let rec3 = await cToken.redeem(redeemAmount, { from: sender });
        console.log("redeem", rec3.tx)

        let repayAmount = new BN(1e18.toString())
        await erc20Token.approve(cToken.address, repayAmount)
        let rec4 = await cToken.repayBorrow(0, { from: sender });
        console.log("repayBorrow", rec4.tx)
    }
};
