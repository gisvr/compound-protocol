
const Migrations = artifacts.require("Migrations");
const MockDAI = artifacts.require("MockDAI");

const CErc20 = artifacts.require("CErc20Immutable");

const CEther = artifacts.require("CEther")

const Comptroller = artifacts.require("Comptroller");
const JumpRateModel = artifacts.require("JumpRateModel");

module.exports = async (deployer, network, accounts) => {
    let networkId = await web3.eth.net.getId();
    console.log(networkId);
    let [sender, alice] = accounts;
    await deployer.deploy(Migrations);

    let value = 1e20.toString();
    await deployer.deploy(MockDAI);
    let DAI = await MockDAI.deployed();
    DAI.mint(value)
    DAI.mint(value, { from: alice })

    await deployer.deploy(Comptroller);
    let comptroller = await Comptroller.deployed();

    // //(uint baseRatePerYear, uint multiplierPerYear, uint jumpMultiplierPerYear, uint kink_)
    await deployer.deploy(JumpRateModel, 1, 1, 1, 1);
    let jumpRateModel = await JumpRateModel.deployed();

    // await deployer.deploy(InterestRateModel, 1);
    // let interestRateModel = await InterestRateModel.deployed();

    await deployer.deploy(CErc20, DAI.address,//    underlying_,
        comptroller.address, //  ComptrollerInterface comptroller_,
        jumpRateModel.address,   //     InterestRateModel interestRateModel_,
        1, //    uint initialExchangeRateMantissa_,
        "MC name DAI", //  string memory name_,
        "cDAI", //   string memory symbol_,
        18,  //     uint8 decimals_,
        sender  //     address payable admin_, 
    );

    await deployer.deploy(CEther, 
        comptroller.address, //  ComptrollerInterface comptroller_,
        jumpRateModel.address,   //     InterestRateModel interestRateModel_,
        1, //    uint initialExchangeRateMantissa_,
        "cETH name", //  string memory name_,
        "cETH", //   string memory symbol_,
        18,  //     uint8 decimals_,
        sender  //     address payable admin_, 
    );


    let cToken = await CErc20.deployed()
    let cEther = await CEther.deployed()

    // 加入市场
    await comptroller.enterMarkets([cToken.address,cEther.address])
    // 上架
    await comptroller._supportMarket(cToken.address)
    await comptroller._supportMarket(cEther.address)

  
    
 
    const cTokens = await comptroller.getAllMarkets();
    console.log(cTokens)

};
