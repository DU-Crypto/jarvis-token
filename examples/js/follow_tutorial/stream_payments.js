var EventSource = require('eventsource');
var es = new EventSource('https://horizon-testnet.stellar.org/accounts/GD2P2QKP7XKGWOILBSWK7L4U7M26J2CRMXJAWM2F3TEVGFPKYCGZS6RJ/payments');
es.onmessage = function(message) {
    var result = message.data ? JSON.parse(message.data) : message;
    console.log('New payment:');
    console.log(result);
};
es.onerror = function(error) {
    console.log('An error occured!');
}
