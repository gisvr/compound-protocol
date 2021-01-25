

let nodeProvider = require("../../utils/ganache.provider");


let web3, sender, alice;
describe("CToken", function () {
    before(async () => {
        let comptroller = await nodeProvider.getCompound("Comptroller");
        let CErc20 = await nodeProvider.getCompound("CErc20");
        let CEther = await nodeProvider.getCompound("CEther");
        let MockDAI = await nodeProvider.getCompound("MockDAI")
        const cTokens = await comptroller.getAllMarkets();

        [sender, alice] = nodeProvider.getAccounts();
        for (let addr of cTokens) {
            let cToken = await CErc20.at(addr)
            let cSymbol = await cToken.symbol()
            if (cSymbol == "cETH") {
                this.cETH = CEther //await CEther.at(addr)
                continue;
            }
            this[cSymbol] = cToken;


            let underlying = await cToken.underlying()
            let erc20Token = await MockDAI.at(underlying);
            let symbol = await erc20Token.symbol()
            this[symbol] = erc20Token;
            // console.log("symbol %s, addr %s , underlying: %s", cSymbol, cToken.address, underlying);
        }

    });
    it("Mint ETH ", async () => {
        let ethAmount = 2e18.toString();
        let ethRec1 = await this.cETH.mint({ value: ethAmount });
        console.log("ETH mint", ethRec1.tx)

        let ethBorrowAmount = 1e18.toString()
        let ethRec2 = await this.cETH.borrow(ethBorrowAmount);
        console.log("ETH borrow", ethRec2.tx)

        let foo = await this.cETH.supplyRatePerBlock()
        console.log("cETH supplyRatePerBlock", foo.toString())

    });

    it("Compound cTokne info", async () => {
        let amount = 1e20.toString();
        let erc20Token = this.DAI;
        let cToken = this.cDAI;

        let borrowRate = await cToken.borrowRatePerBlock();
        console.log("cERC20 borrowRatePerBlock", borrowRate.toString())

        let supplyRate = await cToken.supplyRatePerBlock()
        console.log("cERC20 supplyRatePerBlock", supplyRate.toString())

    });

    it("Mint ERC20 ", async () => {
        let amount = 1e20.toString();
        let erc20Token = this.DAI;
        let cToken = this.cDAI;
        await erc20Token.mint(amount)
        // erc20Token.mint(amount, { from: alice })
        await erc20Token.approve(cToken.address, amount)

        let rec1 = await cToken.mint(amount, { from: sender });
        console.log("mint", rec1.tx)

        let rec2 = await cToken.borrow(amount, { from: sender });
        console.log("borrow", rec2.tx)

        let foo = await cToken.supplyRatePerBlock()
        console.log("cERC20 supplyRatePerBlock", foo.toString())

    });

    it("Redeem sender", async () => {

    });

    it("Borrow alice", async () => {


    });


});


