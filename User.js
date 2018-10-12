class User {
  constructor(name) {
    this.name = name;
    this.proxy = null;
    this.recoveryKey = null;
    this.ipfsKey = null;
    this.subjects = [];
    assignAddress.call(this); // Assign address property
  }

  // Run contracts function
  run(callback) {
    setSender(this.address);// Set sunder as User

    callback.call(this);
  }
}

module.exports = User;
