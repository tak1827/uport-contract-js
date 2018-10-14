const Assert = require('assert');
const Proxy = require('./Proxy');

class MetaIdentityManager {

  onlyAuthorized() {
    Assert(msg.sender === this.relay,
      `No authorication msg.sender: ${msg.sender}`
    );
  }

  onlyOwner(identity, sender) {
    Assert(this.isOwner(identity, sender),
      `Invalid owner: ${sender}`
    );
  }

  constructor(timeLock, relay) {
    this.timeLock = timeLock;
    this.owners = {};
    this.relay = relay;
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

  forwardTo(sender, identity, className, methodName, data) {
    this.onlyAuthorized();// Only accept tx from txRelay
    this.onlyOwner(identity, sender);

    setSender(this.address);// Set sender as IdentityManager

    // Forward to proxy
    identity.forward(className, methodName, data);

    return true;
  }

  isOwner(identity, owner) {
    const now = (new Date()).getTime();
    
    return (this.owners[identity.address][owner] > 0 && 
      (this.owners[identity.address][owner] + this.timeLock) <= now);
  }
}

module.exports = MetaIdentityManager;
