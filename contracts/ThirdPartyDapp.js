class ThirdPartyDapp {

  constructor() {
    this.registry = {};
    assignAddress.call(this); // Assign address property
  }

  set(identifier, subject, value) {

    if (typeof this.registry[identifier] === "undefined" ) {
      this.registry[identifier] = {};
    }
    
    if (typeof this.registry[identifier][msg.sender] === "undefined" ) {
      this.registry[identifier][msg.sender] = {}
    }

    this.registry[identifier][msg.sender][subject] = value;
  }

  get(identifier, issuer, subject) {
    return this.registry[identifier][issuer][subject];
  }
}

module.exports = ThirdPartyDapp;
