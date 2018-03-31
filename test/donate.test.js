// Test contract file Donate.sol

const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

// compiled version of contracts
const compiledDonateFactory = require('../ethereum/build/:DonateFactory.json');
const compiledDonateProject = require('../ethereum/build/:DonateProject.json');

let accounts;
let factory;
let donateProject;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(compiledDonateFactory.interface))
    .deploy({ data: compiledDonateFactory.bytecode })
    .send({ from: accounts[0], gas: '1000000' });

  await factory.methods.createDonateProject('100').send({
    from: accounts[0],
    gas: '1000000'
  });

  donateProjectList = await factory.methods.getAllDonateProjects().call();
  donateProjectAddress = donateProjectList[0];
  donateProject = await new web3.eth.Contract(JSON.parse(compiledDonateProject.interface), donateProjectAddress);
});

describe('DonateProject', () => {
  it('can deploy a factory and a donateProject', () => {
    assert.ok(factory.options.address);
    assert.ok(donateProject.options.address);
  });

  it('can use factory to deploy a donateProject with a minimum value', async () => {
    assert.equal(await donateProject.methods.minimumDonateValue().call(), 100);
    assert.equal(await donateProject.methods.manager().call(), accounts[0]);
  });

  it('can handle whole donate process', async () => {
    await donateProject.methods.donate().send({
      from: accounts[0],
      value: web3.utils.toWei('10', 'ether')
    });
    await donateProject.methods.donate().send({
      from: accounts[1],
      value: web3.utils.toWei('10', 'ether')
    });
    try {
      await donateProject.methods.donate().send({
        value: '99',
        from: accounts[2]
      });
      assert(false);
    } catch (err) {
      assert(err);
    }

    let donatorCount = await donateProject.methods.donatorCount().call();
    assert (donatorCount, 2);

    await donateProject.methods.createRequest('toAccount2', 100, accounts[2]).send({
      from: accounts[0],
      gas: '1000000'
    });

    try {
      await donateProject.methods.finalizeRequest(0).send({
        from: accounts[0],
        gas: '1000000'
      });
      assert(false);
    } catch (err) {
      assert(err);
    }

    await donateProject.methods.approveRequest(0).send({
      from: accounts[0],
      gas: '1000000'
    });
    await donateProject.methods.approveRequest(0).send({
      from: accounts[1],
      gas: '1000000'
    });

    await donateProject.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: '1000000'
    });
    let thisDonateRequest = await donateProject.methods.donateRequests(0).call();

    assert.equal(thisDonateRequest.isComplete, true);

    let balance = await web3.eth.getBalance(accounts[2]);
    balance = web3.utils.fromWei(balance, 'ether');
    balance = parseFloat(balance);
    assert(balance >= 99);  // account[2] received the money
  })
});
