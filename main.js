const { randomBytes } = require('crypto');
const { ecsign, privateToPublic } = require('ethereumjs-util');
const Proxy = require('./contracts/Proxy');
const MetaIdentityManager = require('./contracts/MetaIdentityManager');
const ThirdPartyDapp = require('./contracts/ThirdPartyDapp');
const { IPFS, buildAttestation, decodeBase64 } = require('./IPFS');
const { generatePrivateKey, getPubkey, getCompressedPubkey, getPubkeyFromCompressedPubkey,
  sign, verify, buildPayload } = require('./JWT');
const User = require('./User');
const { TxRelay, calculateEIP191Hash } = require('./contracts/TxRelay');


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
global.TR = new TxRelay();
global.MIM = new MetaIdentityManager(10, TR.address);
global.TD = new ThirdPartyDapp();// Contents is same as UportRegistry

// Pseudo IPFS
global.IS = new IPFS();


/********************************
 Execute contracts
*********************************/

/* 
 1. Create user object.
 */

// User object hold proxy object and jwt private key
let user = new User("Christian Lundkvist");


/*
 2. Create Proxy as identity
 */
user.run(function() {

  // Proxy contract is deployed by IdentityManager
  this.proxy = MIM.createIdentity(this.address);
});


/*
 3. Generate JWT 
 */

// Define unique subject
user.subjects.push('Second-JWT');

const payload = buildPayload(
  { name: user.name, identifier: MIM.address }, 
  user.subjects[0], 
  user.proxy.address,
);

// Generate private key to sign JWT
user.jwtKey = generatePrivateKey();

const token = sign(payload, user.jwtKey);


/*
 4. Add attestation to IPFS
 */

// Include pubkey to assertion for signature verification
const pubkey = getCompressedPubkey(user.jwtKey);

// Build attestation. 
const attestation = buildAttestation(token, pubkey);

// Add to IPFS
const hash = IS.add( JSON.stringify(attestation) );


/*
 5. Create signature for txRelay
 */

// Generate private key for txRelay 
user.txRelayKey = randomBytes(32);

// Retrieve pub key and set as claimedSender
// This is used for signature verification
const claimedSender = privateToPublic(user.txRelayKey).toString('hex');

// Empty because Tx sender is owner.
// User can delegate another user as sender.
const listOwner = '';

// Nonce is for preventing from replay attack.
const nonce = TR.getNonce(claimedSender);

// Data to sign
const data = { 
  claimedSender,
  sender: user.address,
  identity: user.proxy,
  className: 'ThirdPartyDapp', // Contract name called by proxy
  methodName: 'set', // Function name called by proxy
  data: {
    identifier: MIM.address,
    subject: user.subjects[0],
    value: hash
  }
};

// Calculate EIP191 format hash
const eip191Hash = calculateEIP191Hash(
  listOwner, nonce, MIM.address, JSON.stringify(data)
)

const sig = ecsign(eip191Hash, user.txRelayKey, 1);


/*
 6. Sned transaction
 */
user.run(function() {

  // User send transaction with no fund
  // Then, funded by Sensui server.

  // Send transaction to txRelay contract
  TR.relayMetaTx(
    sig.v, sig.r, sig.s, MIM, data, listOwner
  );
});


console.log({
  User: JSON.stringify(user),
  MIM: JSON.stringify(MIM),
  IS: JSON.stringify(IS),
  TD: JSON.stringify(TD)
})
