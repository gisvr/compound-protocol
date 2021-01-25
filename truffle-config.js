const HDWalletProvider = require('truffle-hdwallet-provider');
const conf = require('./config/index');

require('dotenv').config();

let nodeProvider = conf[conf.network].node;
nodeProvider.provider = new HDWalletProvider(process.env.MNENOMIC, nodeProvider.url, 10, 5);
// nodeProvider.gas = 500e4 //"0xB71B00"; //12,000,000
module.exports = {
  //自定义contracts目录
  // contracts_directory: "./allMyStuff/someStuff/theContractFolder",
  //自定义build目录
  // contracts_build_directory: "./output",
  // 自定义 deploy 目录
  migrations_directory: './migrations/mint',

  api_keys: {
    etherscan: process.env.ETHERSCAN_KEY,
  },

  networks: {
    development: nodeProvider,
    main: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNENOMIC,
          'https://mainnet.infura.io/v3/' + process.env.INFURA_API_KEY,
          0,
          10
        ),
      network_id: 1, // Main's id
      gas: 3500000, // Gas sent with each transaction (default: ~5000000)
      gasPrice: 90000000000, // 75 gwei (in wei) (default: 100 gwei)
    },
  },

  plugins: ['solidity-coverage', 'truffle-plugin-verify'],

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: '0.5.16', // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {
        // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 250,
        },
      },
    },
  },
};
