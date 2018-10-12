const Assert = require('assert');
const Owned = require('./Owned');

class Proxy extends Owned {

  constructor() { super(); }

  forward(className, methodName, data) {
    this.onlyOwner();

    setSender(this.address);// Set sender as Proxy

    Assert(this.executeCall(className, methodName, data));
  }

  executeCall(className, methodName, data) {

  	if (className === 'UportRegistry' && methodName === 'set') {
  		const { identifier, subject, value } = data;
  		UR.set(identifier, subject, value);

  	} else if (className === 'UportRegistry' && methodName === 'get') {
			const { identifier, issur, subject } = data;
  		UR.get(identifier, issur, subject);
  	}

  	return true;
  }
}

module.exports = Proxy;
