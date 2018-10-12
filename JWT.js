const JWT = require('jsonwebtoken');
const ECDSA = require('ecdsa-secp256r1'); // Use 'secp256r1'

function generatePrivateKey() {
  return ECDSA.generateKey();
}

function getPubkey(privateKey) {
  return privateKey.asPublic();
}

function getCompressedPubkey(privateKey) {
  return privateKey.toCompressedPublicKey();
}

function getPubkeyFromCompressedPubkey(compressedPubkey) {
  return ECDSA.fromCompressedPublicKey(compressedPubkey);
}

function sign(payload, privateKey) {
	return JWT.sign(
		payload, 
		privateKey.toPEM(), 
		{ algorithm: 'ES256' }
	);
}

function verify(token, publicKey) {
	return JWT.verify(
		token, 
		publicKey.toPEM()
	);
}

/* === Payload Format ===
{
	attribute: {
	  name: user name,
	  identifier: IdenttityManager address
	},
	sub: Unique subject of this token,
	iss: Proxy address,
	exp: Expire datetime,
	iat: Issued datetime
},
*/
function buildPayload(attribute, subject, issuer) {
	return {
		attribute,
    sub: subject,
    iss: issuer,
    exp: Math.floor((new Date()).getTime()/1000) + 60*60*24*365 // Expire 1 year later
	}
}

module.exports = {
	generatePrivateKey, getPubkey, getCompressedPubkey, getPubkeyFromCompressedPubkey, 
	sign, verify, buildPayload
};
