var StellarBase = require("stellar-base");
StellarBase.Network.useTestNetwork();

var keypair = StellarBase.Keypair.fromSecret('SA3VD5CPCD7C3D43NAFSKQVDS4GNHV5UHCLA4WPWSKRJIBBGPOPVUTU4');
var account = new StellarBase.Account(keypair.publicKey(), "713226564141056");

var amount = "100";
var transaction = new StellarBase.TransactionBuilder(account)
  .addOperation(StellarBase.Operation.createAccount({
    destination: StellarBase.Keypair.random().publicKey(),
    startingBalance: amount
  }))
  .build();

transaction.sign(keypair);

console.log(transaction.toEnvelope().toXDR().toString("base64"));

