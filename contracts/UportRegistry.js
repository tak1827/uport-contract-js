class UportRegistry {

  constructor() {
    this.registry = {};
    assignAddress.call(this); // Assign address property
  }

  set(registrationIdentifier, subject, value){

    if (typeof this.registry[registrationIdentifier] == "undefined" ) {
      this.registry[registrationIdentifier] = {};
    }
    
    if (typeof this.registry[registrationIdentifier][msg.sender] == "undefined" ) {
      this.registry[registrationIdentifier][msg.sender] = {}
    }

    this.registry[registrationIdentifier][msg.sender][subject] = value;
  }

  get(registrationIdentifier, issuer, subject)  {
    return this.registry[registrationIdentifier][issuer][subject];
  }
}

module.exports = UportRegistry;
