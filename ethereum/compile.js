const path = require('path');
const solidityCompiler = require('solc');
const fs = require('fs-extra');

// clear old build file
const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

const source = fs.readFileSync(path.resolve(__dirname, 'contracts', 'Donate.sol'), 'utf-8');
const compiledContracts = solidityCompiler.compile(source, 1).contracts;

fs.ensureDirSync(buildPath);
for (let contract in compiledContracts) {
  fs.outputJsonSync(path.resolve(buildPath, contract + '.json'), compiledContracts[contract])
}
