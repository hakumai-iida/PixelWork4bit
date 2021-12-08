const fs = require('fs');
const HDWalletProvider = require('@truffle/hdwallet-provider');

const mainnetInfuraPath = fs.readFileSync("./polygon_infura_path.txt").toString().trim();
const mainnetPrivateKey = fs.readFileSync("./polygon_private_key.txt").toString().trim();
const mainnetEthereumAddress = fs.readFileSync("./polygon_ethereum_address.txt").toString().trim();

const mumbaiInfuraPath = fs.readFileSync("./mumbai_infura_path.txt").toString().trim();
const mumbaiPrivateKey = fs.readFileSync("./mumbai_private_key.txt").toString().trim();
const mumbaiEthereumAddress = fs.readFileSync("./mumbai_ethereum_address.txt").toString().trim();

module.exports = {
  networks: {

    //--------------------------------
    // mainnet
    //--------------------------------
    polygon_infura: {
      provider: function(){
        return( new HDWalletProvider( mainnetPrivateKey, mainnetInfuraPath ) );
      },
      skipDryRun: true,
      confirmations: 1,

      network_id: 137,
      gas: 5000000,           // 5 m gas
      gasPrice: 32000000000,  // 32 g wei
      from: mainnetEthereumAddress
    },

    //--------------------------------
    // mumbai(testnet)
    //--------------------------------
    mumbai_infura: {
      provider: function () {
        return new HDWalletProvider(mumbaiPrivateKey, mumbaiInfuraPath);
      },
      skipDryRun: true,
      confirmations: 1,

      network_id: 80001,
      gas: 5000000,           // 5 m gas
      gasPrice: 10000000000,  // 10 g wei
      from: mumbaiEthereumAddress,
    },

    // rinkeby: ローカルノードへのRPC接続
    rinkeby_rpc: {
      host: "localhost",
      port: 8545,
      network_id: 4,
      gas: 5000000,           // 5 m
      gasPrice: 10000000000   // 10 gwei
    }
    
  },

  //--------------------------------
  // compile settings
  //--------------------------------
  compilers: {
    solc: {
      version: "0.8.7",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
}
