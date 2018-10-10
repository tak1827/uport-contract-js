const Assert = require('assert');
const Proxy = require('./Proxy');

class IdentityManager {

  validAddress(addr) {
    Assert(addr !== 0,
      `Invalid address: ${addr}`
    );
  }

  onlyOwner(identity) {
    Assert(this.isOwner(identity, msg.sender),
      `Invalid owner: ${msg.sender}`
    );
  }

  constructor(_userTimeLock, _adminTimeLock, _adminRate) {
    Assert(_adminTimeLock >= _userTimeLock);

    this.adminTimeLock = _adminTimeLock;
    this.userTimeLock = _userTimeLock;
    this.adminRate = _adminRate;
    this.owners = {};
    this.recoveryKeys = {};
    this.limiter = null;
    this.migrationInitiated = null;
    this.migrationNewAddress = null;
    assignAddress.call(this); // Assign address property
  }

  createIdentity(owner, recoveryKey) {
    this.validAddress(owner);

    setSender(this.address);// Set sender as IdentityManager

    const identity = new Proxy();
    this.owners[identity.address] = {
      [owner]: (new Date()).getTime() - this.adminTimeLock
    }
    this.recoveryKeys[identity.address] = recoveryKey;

    return identity;
  }

  forwardTo(identity, className, methodName, data) {
    this.onlyOwner(identity);

    setSender(this.address);// Set sender as IdentityManager

    identity.forward(className, methodName, data);
  }

  isOwner(identity, owner) {
    const now = (new Date()).getTime();
    return (this.owners[identity.address][owner] > 0 && 
      (this.owners[identity.address][owner] + this.userTimeLock) <= now);
  }
}

module.exports = IdentityManager;
