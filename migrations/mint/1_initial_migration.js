
const Migrations = artifacts.require("Migrations");
const MockDAI = artifacts.require("MockDAI");

const CErc20 = artifacts.require("CErc20Immutable");

const Comptroller = artifacts.require("Comptroller");
const JumpRateModel = artifacts.require("JumpRateModel");

let nodeProvider = require("../../utils/ganache.provider");


module.exports = async (deployer, network, accounts) => {
    let [sender, alice] = accounts;
    await deployer.deploy(Migrations);

    await deployer.deploy(Comptroller);
    let comptroller = await Comptroller.deployed();

    // //(uint baseRatePerYear, uint multiplierPerYear, uint jumpMultiplierPerYear, uint kink_)
    await deployer.deploy(JumpRateModel, 1, 1, 1, 1);
    let jumpRateModel = await JumpRateModel.deployed();


    let value = 1e20.toString();
    let provider = await nodeProvider.getAaveV1('LendingPoolAddressesProvider');
    let lpAddr = await provider.getLendingPool();
    this.lpContractProxy = await nodeProvider.getAaveV1('LendingPool', lpAddr);
    let reserves = await this.lpContractProxy.getReserves();
    for (let addr of reserves) {
        if (addr == "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") continue;
        let erc20Token = await MockDAI.at(addr);
        let symbol = await erc20Token.symbol();
        erc20Token.mint(value)
        erc20Token.mint(value, { from: alice })

        console.log(symbol, erc20Token.address);
        await deployer.deploy(CErc20, erc20Token.address,//    underlying_,
            comptroller.address, //  ComptrollerInterface comptroller_,
            jumpRateModel.address,   //     InterestRateModel interestRateModel_,
            1, //    uint initialExchangeRateMantissa_,
            "MC name " + symbol, //  string memory name_,
            "c" + symbol, //   string memory symbol_,
            18,  //     uint8 decimals_,
            sender  //     address payable admin_, 
        );

        let cToken = await CErc20.deployed()
        // 加入市场
        await comptroller.enterMarkets([cToken.address])
        // 上架
        await comptroller._supportMarket(cToken.address)

    }

    const cTokens = await comptroller.getAllMarkets();
    console.log(cTokens)

};
