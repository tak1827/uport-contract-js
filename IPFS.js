const CryptoJS = require('crypto-js');

class IPFS {
  constructor() {
    this.hashes = {};
  }

  add(data) {

    //FIXME: This hash is not accurate
    const hash = CryptoJS.SHA256(data).toString();

    this.hashes[hash] = data;

    return hash;
  }

  cat(hash) {
    return typeof this.hashes[hash] === "undefined"
      ? ""
      : this.hashes[hash];
  }
}
/*
Attestation format is as follow
{
  token: JWT,
  data: {
    header: {
      "alg": "ES256",
      "typ": "JWT"
    },
    payload: Payload
    signature: Signature
  },
  encrypted: false,
  publicKey: Publickey corresponding to signature
}
*/
function buildAttestation(token, publicKey) {
  return {
    token,
    data: {
      header: JSON.parse( decodeBase64(token.split(".")[0]) ),
      payload: JSON.parse( decodeBase64(token.split(".")[1]) ),
      signature: token.split(".")[2]
    },
    encrypted: false,
    publicKey
  }
}

function decodeBase64(base64) {
  return Buffer.from(base64, 'base64').toString('utf8');
}

module.exports = { IPFS, buildAttestation, decodeBase64 };
