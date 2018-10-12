const Proxy = require('./contracts/Proxy');
const IdentityManager = require('./contracts/IdentityManager');
const UportRegistry = require('./contracts/UportRegistry');
const { IPFS, buildAttestation, decodeBase64 } = require('./IPFS');
const { generatePrivateKey, getPubkey, getCompressedPubkey, getPubkeyFromCompressedPubkey,
  sign, verify, buildPayload } = require('./JWT');
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
global.IM = new IdentityManager(10);
global.UR = new UportRegistry();

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
  this.proxy = IM.createIdentity(this.address);
});


/*
 3. Generate JWT 
 */

// Define unique subject
user.subjects.push('First-JWT');

const payload = buildPayload(
  { name: user.name, identifier: IM.address }, 
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
user.run(function() {

  // IdentityManager delegate registration to Proxy
  // Proxy register hash to UportRegistry
  IM.forwardTo(
    this.proxy, 
    'UportRegistry',
    'set',
    { 
      identifier: IM.address,
      subject: user.subjects[0],
      value: hash
    }
  );
});


/*
 6. Verify JWT by a third party
 */

// Decode token, then retrieve payload
const decodedPayload = JSON.parse( decodeBase64(token.split(".")[1]) );

// Get IPFS hash from UportRegistry
const ipfsHash = UR.get(
  decodedPayload.attribute.identifier,
  decodedPayload.iss,
  decodedPayload.sub
);

// Get attestation from IPFS
const ipfsAtt = IS.cat(ipfsHash);

// Retrieve compressed public key form attestation
const compressedPubkey = JSON.parse(ipfsAtt).publicKey;

// Retrieve public key
const ipfsPubkey = getPubkeyFromCompressedPubkey(compressedPubkey);

// Verify token using public key which is hosted by IPFS
verify(token, ipfsPubkey);

console.log({
  User: JSON.stringify(user),
  IM: JSON.stringify(IM),
  UR: JSON.stringify(UR),
  IS: JSON.stringify(IS),
})
