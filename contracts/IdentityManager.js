const Assert = require('assert');
const Proxy = require('./Proxy');

class IdentityManager {

  onlyOwner(identity) {
    Assert(this.isOwner(identity, msg.sender),
      `Invalid owner: ${msg.sender}`
    );
  }

  constructor(timeLock) {
    this.timeLock = timeLock;
    this.owners = {};
    assignAddress.call(this); // Assign address property
  }

createIdentity(owner) {
  setSender(this.address);// Set sender as IdentityManager

  // Generate Proxy contract
  const identity = new Proxy();

  this.owners[identity.address] = {
    [owner]: (new Date()).getTime() - this.timeLock
  }

  return identity;
}

  forwardTo(identity, className, methodName, data) {
    this.onlyOwner(identity);

    setSender(this.address);// Set sender as IdentityManager

    // Forward to proxy
    identity.forward(className, methodName, data);
  }

  isOwner(identity, owner) {
    const now = (new Date()).getTime();
    return (this.owners[identity.address][owner] > 0 && 
      (this.owners[identity.address][owner] + this.timeLock) <= now);
  }
}

module.exports = IdentityManager;
