const Assert = require('assert');

class Owned {

  onlyOwner() {
    return Assert(this.isOwner(msg.sender),
      `${msg.sender} is not owner`
    );
  }

  constructor() { 
    this.owner = msg.sender;
    assignAddress.call(this); // Assign address property
  }

  isOwner(addr) { return addr === this.owner; }

  transfer(newOwner) {
    this.onlyOwner();

    this.owner = newOwner;
  }
}

module.exports = Owned;
