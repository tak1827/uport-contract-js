class User {
  constructor(name) {
    this.name = name;
    this.proxy = null;
    assignAddress.call(this); // Assign address property
  }

  // Run contracts function
  run(callback) {
    setSender(this.address);// Set sunder as User

    callback.call(this);
  }
}

module.exports = User;
