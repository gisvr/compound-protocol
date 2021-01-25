module.exports = {
  network: 'geth', 
  ganache: require('./ganache'),
  geth: require('./geth'),
  vpsorGanache: require('./vpsorGanache'),
  deploy: {
    gas: 800e4, //gaslimit
    gasPrice: 20e9, //20 Wei
  },
};
