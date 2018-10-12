const Proxy = require('./contracts/Proxy');
const IdentityManager = require('./contracts/IdentityManager');
const UportRegistry = require('./contracts/UportRegistry');
const { IPFS, buildAttestation, decodeBase64 } = require('./IPFS');
const { generatePrivateKey, getPubkey, getCompressedPubkey, getPubkeyFromCompressedPubkey,
  sign, verify, buildPayload } = require('./JsonWebToken');
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

// Pseudo IPFS
global.IS = new IPFS();


/********************************
  Run contract
*********************************/

// Create user
let user = new User("Christian Lundkvist");

// Create Identity, then assign to user
user.run(function() {
  user.recoveryKey = 'recoveryKey for Christian Lundkvist';
  this.proxy = IM.createIdentity(this.address, user.recoveryKey);
});

// Build payload for JWT
user.subjects.push('First-JWT');
const payload = buildPayload(
  { name: user.name, identifier: IM.address }, 
  user.subjects[0], 
  user.proxy.address,
);

// Generate JWT
user.ipfsKey = generatePrivateKey();
const token = sign(payload, user.ipfsKey);

// Build Attestation
const pubkey = getCompressedPubkey(user.ipfsKey);
const attestation = buildAttestation(token, pubkey);

// Add to IPFS
const hash = IS.add( JSON.stringify(attestation) );
 
// Set jwt to UportRegistry contract
user.run(function() {
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

console.log({
  User: JSON.stringify(user),
  IM: JSON.stringify(IM),
  UR: JSON.stringify(UR),
  IS: JSON.stringify(IS),
})

const decodedPayload = JSON.parse( decodeBase64(token.split(".")[1]) );
const ipfsHash = UR.get(
  decodedPayload.attribute.identifier,
  decodedPayload.iss,
  decodedPayload.sub
);

const ipfsAss = IS.cat(ipfsHash);

const compressedPubkey = JSON.parse(ipfsAss).publicKey;

const pubkey2 = getPubkeyFromCompressedPubkey(compressedPubkey);


verify(token, pubkey2);

