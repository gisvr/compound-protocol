// const HDWalletProvider = require("@truffle/hdwallet-provider");

const {projectId,projectId1, privateKeys, etherscanKey,adminKey} = require("/Users/liyu/github/defi/secrets.json");

// console.log("etherscanKey",etherscanKey)

// secrets.json like this
// {
//     "projectId": "082a56122ba64cdbaf9500ead7f6a5b9",
//     "privateKeys": ["76d0.......45d"]
// }

// const HDWalletProvider = require('@truffle/hdwallet-provider');
// const infuraKey = "fj4jll3k.....";
// const privateKeys = ["xxxxx....."]; // private keys

// const fs = require('fs');
// const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
    migrations_directory: "./migrations",
    api_keys: {
        etherscan: etherscanKey
    },
    /**
     * Networks define how you connect to your ethereum client and let you set the
     * defaults web3 uses to send transactions. If you don't specify one truffle
     * will spin up a development blockchain for you on port 9545 when you
     * run `develop` or `test`. You can ask a truffle command to use a specific
     * network from the command line, e.g
     *
     * $ truffle test --network <network-name>
     */


    networks: {
        development: {host: "127.0.0.1", port: 8545, network_id: "*"},

    },

    // Set default mocha options here, use special reporters etc.
    mocha: {
        // timeout: 100000
    },

    // Configure your compilers
    compilers: {
        solc: {
            version: "0.5.16",    // Fetch exact version from solc-bin (default: truffle's version)
            // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
            settings: {          // See the solidity docs for advice about optimization and evmVersion
                optimizer: {
                    enabled: true,
                    runs: 200
                },
                //  evmVersion: "byzantium"
            }
        }
    },
    plugins: [
        'truffle-plugin-verify'
    ]
}
