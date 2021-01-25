const newLocal = 'bignumber.js';
const BigNumber = require(newLocal);

let toRay = (num) => {
  const oneRay = new BigNumber(Math.pow(10, 27));
  return new BigNumber(num).multipliedBy(oneRay).toFixed();
};

const oneEth = new BigNumber(Math.pow(10, 18));
// strategy: {
//     optimalUtilizationRate:toRay(0.65),
//     baseVariableBorrowRate: toRay(0),
//     variableRateSlope1: toRay(0.08),
//     variableRateSlope2: toRay(0.6),
//     stableRateSlope1: toRay(0.6),
//     stableRateSlope2: toRay(1),
// }
module.exports = {
  node: {
    url: 'http://103.152.170.221:8545',
    network_id: '8545',
    from: '0x855FA758c77D68a04990E992aA4dcdeF899F654A',
  },
  aaveV2: {
    ethUsd: '380',
    tokenList: [
      {
        symbol: 'DAI',
        decimals: 18,
        priceEth: oneEth,
        address: '0x10E630EA8a999595398cfD6733abb46697DED454',
        isActive: true,
        collateral: {
          baseLTVs: '8000', //资产抵押比率
          liquidationThresholds: '8250', //清算的阈值
          liquidationBonus: '10500', //清算奖励
        },
        borrow: {
          reserveFactor: '1000',
          stableBorrowRateEnabled: true, // 是否启用固定利率借贷
          borrowingEnabled: true, // 是否启用借贷
          marketBorrowRate: toRay(0.039),
          marketLiquidityRate: toRay(0),
        },
        strategy: [toRay(0.65), toRay(0), toRay(0.08), toRay(0.6), toRay(0.6), toRay(1)],
      },
      {
        symbol: 'BAT',
        decimals: 18,
        address: '0x2FCaa33F3f9C52f31C2D11fb4dB54e47B2e26996',
        priceEth: oneEth.div(10),
        isActive: true,
        collateral: {
          baseLTVs: '8000', //资产抵押比率
          liquidationThresholds: '8250', //清算的阈值
          liquidationBonus: '10500', //清算奖励
        },
        borrow: {
          reserveFactor: '1000',
          stableBorrowRateEnabled: true, // 是否启用固定利率借贷
          borrowingEnabled: true, // 是否启用借贷
          marketBorrowRate: toRay(0.039),
          marketLiquidityRate: toRay(0),
        },
        strategy: [toRay(0.65), toRay(0), toRay(0.08), toRay(0.6), toRay(0.6), toRay(1)],
      },
      {
        symbol: 'WBTC',
        decimals: 8,
        priceEth: oneEth.times(100),
        address: '0x153E559908F764a17F08C1afa467d9D059A0A6fa',
        isActive: true,
        collateral: {
          baseLTVs: '8000', //资产抵押比率
          liquidationThresholds: '8250', //清算的阈值
          liquidationBonus: '10500', //清算奖励
        },
        borrow: {
          reserveFactor: '1000',
          stableBorrowRateEnabled: true, // 是否启用固定利率借贷
          borrowingEnabled: true, // 是否启用借贷
          marketBorrowRate: toRay(0.039),
          marketLiquidityRate: toRay(0),
        },
        strategy: [toRay(0.65), toRay(0), toRay(0.08), toRay(0.6), toRay(0.6), toRay(1)],
      },
      {
        symbol: 'USDT',
        decimals: 6,
        address: '0x628d98b16cE53C7437e0A8B303FC6C506DE901F7',
        priceEth: oneEth.div(1000),
        isActive: true,
        collateral: {
          baseLTVs: '8000', //资产抵押比率
          liquidationThresholds: '8250', //清算的阈值
          liquidationBonus: '10500', //清算奖励
        },
        borrow: {
          reserveFactor: '1000',
          stableBorrowRateEnabled: true, // 是否启用固定利率借贷
          borrowingEnabled: true, // 是否启用借贷
          marketBorrowRate: toRay(0.039),
          marketLiquidityRate: toRay(0),
        },
        strategy: [toRay(0.65), toRay(0), toRay(0.08), toRay(0.6), toRay(0.6), toRay(1)],
      },
      {
        symbol: 'USDC',
        decimals: 6,
        address: '0xA3CE8926b4d797682841dBb928fc915710dcFd8e',
        priceEth: oneEth.div(1000),
        isActive: true,
        collateral: {
          baseLTVs: '8000', //资产抵押比率
          liquidationThresholds: '8250', //清算的阈值
          liquidationBonus: '10500', //清算奖励
        },
        borrow: {
          reserveFactor: '1000',
          stableBorrowRateEnabled: true, // 是否启用固定利率借贷
          borrowingEnabled: true, // 是否启用借贷
          marketBorrowRate: toRay(0.039),
          marketLiquidityRate: toRay(0),
        },
        strategy: [toRay(0.65), toRay(0), toRay(0.08), toRay(0.6), toRay(0.6), toRay(1)],
      },
    ],
  },
};
