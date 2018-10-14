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
 5. Register IPFS hash to UportRegistry contract
 */
// user.run(function() {

//   // IdentityManager delegate registration to Proxy
//   // Proxy register hash to UportRegistry
//   MIM.forwardTo(
//     this.proxy, 
//     'UportRegistry',
//     'set',
//     { 
//       identifier: MIM.address,
//       subject: user.subjects[0],
//       value: hash
//     }
//   );
// });


/*
 5. Create signature for txRelay
 */

// Generate private key for txRelay 
user.txRelayKey = randomBytes(32);

// Empty becasue Tx sender is owner.
// User can delegate another user as sender.
const listOwner = '';

// Retreve pub key and set as sender
const claimedSender = privateToPublic(user.txRelayKey).toString('hex');

// Nonce is for preventing from replay attack.
const nonce = TR.getNonce(claimedSender);

// Data to sign
const data = { 
  claimedSender,
  sender: user.address,
  identity: user.proxy,
  className: 'ThirdPartyDapp',
  methodName: 'set',
  data: {
    identifier: MIM.address,
    subject: user.subjects[0],
    value: hash
  }
};

// Calculate hash
const eip191Hash = calculateEIP191Hash(
  listOwner, nonce, MIM.address, JSON.stringify(data)
)

const sig = ecsign(eip191Hash, user.txRelayKey, 1);


/*
 6. Relay transaction
 */
user.run(function() {

  // Send tx to relayMetaTx of txRelay contract
  TR.relayMetaTx(
    sig.v, sig.r, sig.s, MIM, data, listOwner
  )
});


/*
 6. Verify JWT by a third party
 */

// // Decode token, then retrieve payload
// const decodedPayload = JSON.parse( decodeBase64(token.split(".")[1]) );

// // Get IPFS hash from UportRegistry
// const ipfsHash = UR.get(
//   decodedPayload.attribute.identifier,
//   decodedPayload.iss,
//   decodedPayload.sub
// );

// // Get attestation from IPFS
// const ipfsAtt = IS.cat(ipfsHash);

// // Retrieve compressed public key form attestation
// const compressedPubkey = JSON.parse(ipfsAtt).publicKey;

// // Retrieve public key
// const ipfsPubkey = getPubkeyFromCompressedPubkey(compressedPubkey);

// // Verify token using public key which is hosted by IPFS
// // Please use node grater than v10
// verify(token, ipfsPubkey);

console.log({
  User: JSON.stringify(user),
  MIM: JSON.stringify(MIM),
  IS: JSON.stringify(IS),
  TD: JSON.stringify(TD)
})
