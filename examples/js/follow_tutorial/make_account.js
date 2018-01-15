var Keypair = require("stellar-base").Keypair;

var newAccount = Keypair.random();

console.log("New key pair created!");
console.log("  Account ID: " + newAccount.publicKey());
console.log("  Secret: " + newAccount.secret());


