const Proxy = require('./contracts/Proxy');
const IdentityManager = require('./contracts/IdentityManager');
const UportRegistry = require('./contracts/UportRegistry');
const User = require('./User');


/********************************
 Global variables and functions
*********************************/

// Define ethereum address seed as 4 (hex) character
let uniqueid = "f000";

// Generate ethereum address, and assign to object witch call this function
global.assignAddress = function () {
  if (typeof this.address == "undefined" ) {
    uniqueid = (Number(`0x${uniqueid}`) + 1).toString(16);
    this.address = uniqueid;
  }

  return this.address;
};

// Same as msg.sender of solidity
global.msg = { sender: null }

// Set msg.sender
global.setSender = function (sender) {
  msg.sender = sender;
}

// Deploy contracts
global.IM = new IdentityManager(10,10,10);
global.UR = new UportRegistry();


/********************************
  Run contract
*********************************/

// Create user
let user = new User("okabe");

// Create Identity, then assign to user
user.run(function() {
  this.proxy = IM.createIdentity(this.address, 'lpc');
});

// Set jwt to UportRegistry contract
user.run(function() {
  IM.forwardTo(
    this.proxy, 
    'UportRegistry', // Execute class name
    'set', // Execute function name
    {
      identifier: this.proxy.address,
      subject: "tak",
      value: 'fjdksjflkdsfj;dsf;sda' // JWT token hash
    }
  );
});

console.log(JSON.stringify( UR ))
