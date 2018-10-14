const Assert = require('assert');
const CryptoJS = require('crypto-js');
const { ecrecover, hashPersonalMessage } = require('ethereumjs-util');


class TxRelay {
  constructor() {
    this.nonce = {};
    this.whitelist = {};
    assignAddress.call(this); // Assign address property
  }

  relayMetaTx(
    sigV,
    sigR,
    sigS,
    destination, 
    data, 
    listOwner
  ) {

    Assert(listOwner === '' ||
      this.whitelist[listOwner][msg.sender],
      `Not allowed listOwner: ${listOwner}`
    )

    const claimedSender = this.getAddress(data);

    // use EIP 191
    // 0x19 :: version :: relay :: whitelistOwner :: 
    // nonce :: destination :: data
    const h = calculateEIP191Hash(
      listOwner, 
      this.nonce[claimedSender],
      destination.address,
      JSON.stringify(data)
    )

    const addressFromSig = ecrecover(
      h, sigV, sigR, sigS, 1).toString('hex');

    Assert(claimedSender === addressFromSig,
      `claimedSender don't correspond to addressFromSig`
    )

    setSender(this.address);// Set sunder as TxRelay

    this.nonce[claimedSender]++;
    
    // Specify forwardTo for simplification
    Assert(
      destination.forwardTo(
        data.sender,
        data.identity,
        data.className,
        data.methodName,
        data.data
      )
    );
  }

  getAddress(data) {
    return data.claimedSender;
  }

  getNonce(add) {

    if (typeof this.nonce[add] === 'undefined') {
      this.nonce[add] = 1;
    }

    return this.nonce[add];
  }

  addToWhitelist(senders) {
    this.updateWhitelist(senders, true);
  }

  updateWhitelist(senders, newStatus) {
    
    senders.forEach(sender => {
      if (typeof this.whitelist[msg.sender] === 'undefined') {
        this.whitelist[msg.sender] = {};
      }

      this.whitelist[msg.sender][sender] = newStatus;
    });
  }

}

function calculateEIP191Hash(
  listOwner,
  nonce,
  destination,
  data
) {

  const sha256 = CryptoJS.SHA256(
    `190${listOwner}${nonce}${destination}${data}`
  ).toString();

  return hashPersonalMessage( Buffer.from(sha256, 'hex') );
}

module.exports = { TxRelay, calculateEIP191Hash };
