const Assert = require('assert');
const Owned = require('./Owned');

class Proxy extends Owned {

  constructor() { super(); }

	forward(className, functionName, data) {
	  this.onlyOwner();

	  setSender(this.address);// Set sender as Proxy

	  Assert(this.executeCall(className, functionName, data));
	}

	executeCall(className, functionName, data) {

		if (className === 'UportRegistry' && functionName === 'set') {
			const { identifier, subject, value } = data;

	    // Set IPFS hash to UportRegistry
			UR.set(identifier, subject, value);

		} else if (className === 'UportRegistry' && functionName === 'get') {
			const { identifier, issur, subject } = data;

	    // Get IPFS hash from UportRegistry
			UR.get(identifier, issur, subject);
		
		} else if (className === 'ThirdPartyDapp' && functionName === 'set') {
			const { identifier, subject, value } = data;

	    // Set IPFS hash to ThirdPartyDapp
			TD.set(identifier, subject, value);
		}

		return true;
	}
}

module.exports = Proxy;
