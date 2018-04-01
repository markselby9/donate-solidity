const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');
const compiledDonateFactory = require('./build/:DonateFactory.json');

const provider = new HDWalletProvider(
  'letter fruit garbage board creek april pulse yellow allow hold reject soda',
  'https://rinkeby.infura.io/FJcs5FYTj7SUoHiyKloY'
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(compiledDonateFactory.interface))
    .deploy({ data: compiledDonateFactory.bytecode, arguments: [] })
    .send({ gas: '1000000', from: accounts[0] });

  console.log(interface);
  console.log('Contract deployed to', result.options.address);
};
deploy();