var NodeMinions = function() {};

/* --------------------------------------------------------------------------------------
 * method: NodeNodeMinions.prototype.extendFileNameUntilUnique
 * 	[NODEJS] add an extender string to the end of a filename (filename potentially including a path) - without altering the file-extension
 *	here, the filesystem is actually asked whether a file with the given path already exists and if it exists another extension round is triggered
 * 
 *	parameters:
 *		originalFilepath - {string}
 *		extender - {string||function||number}
 *		callback - {function}
 *
 * returns:
 * 	null
 * 
 * -------------------------------------------------------------------------------------- */
NodeNodeMinions.prototype.extendFileNameUntilUnique = function(originalFilepath, extender, callback) {
	var fs = require('fs');
	fs.exists(
		originalFilepath,
		function(exists) {
			if (exists === false) {
				callback(originalFilepath);
			} else {
				var newFilePath = extendFileName(originalFilepath, extender);
				this.extendFileNameUntilUnique(newFilePath, extender, callback)
			}
		}
	);
	return null;
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: NodeNodeMinions.prototype.getClientAddressFromHttpRequest
 *		[NODEJS] clones an object
 *
 *	parameters:
 *		req - {object} the node http request object
 *
 *	returns:
 *		ip - {string} the ip detected from the request. 0.0.0.0 if detection fails
 * --------------------------------------------------------------------------- */
NodeNodeMinions.prototype.getClientAddressFromHttpRequest = function(req) {
	if (
		typeof req !== 'object' || 
		(typeof req.headers !== 'object' && typeof req.connection !== 'object')
	) {
		return '0.0.0.0';
	}
	var ip = (typeof req.headers['x-forwarded-for'] === 'string') ? req.headers['x-forwarded-for'] : req.connection.remoteAddress;
	return ip;
};


/* --------------------------------------------------------------------------------  
 * function: NodeMinions.prototype.downloadFile
 * 	[NODEJS] fetches a file from a remote host. 
 * 
 *	parameters:
 *		filelink - {string} the url to the file
 *		downloadPath - {string} the full path (including filename) where the downloaded file should be put.
 *		afterDone - {function} something to call when the file is complete. it receives the new filepath as the only parameter
 *
 * returns:
 * 	true
 * 
 * --------------------------------------------------------------------------------  */
NodeMinions.prototype.downloadFile = function (filelink, downloadPath, afterDone) {     
	var util = require('util');
  var http = require('http');
  var url = require('url');
  var path = require('path');
  var fs = require('fs');
  var events = require('events');
	var host = url.parse(filelink).hostname;
	var filename = url.parse(filelink).pathname.split('/').pop();	
	var theurl = http.createClient(80, host);
	var requestUrl = filelink;
	var request = theurl.request(
		'GET', 
		requestUrl, 
		{'host': host}
	);
	request.end();
	request.addListener(
		'response', 
		function (response) {
			response.setEncoding('binary');
			var body = '';
			response.addListener(
				'data', 
				function (chunk) {
					body += chunk;
				}
			);
			response.addListener(
				'end', 
				function() {
					fs.writeFileSync(downloadPath, body, 'binary');
					afterDone(downloadPath);
				}
			);
		}
	);
	return true;
};


/* --------------------------------------------------------------------------------  
 * function: NodeMinions.prototype.consoleCmd
 * 	issue a console command and set a callback, this works better when you are only interested in 
 *	the result of a command without events.
 * 
 *	parameters:
 *		order - {string} commandname
 *		properties - {array} of Attributes for the command
 *		callback - {function} something to call when the file is complete, 
 *			with the string resultat and the statusCode
 *
 * returns:
 * 	true
 * 
 * --------------------------------------------------------------------------------  */
NodeMinions.prototype.consoleCmd = function(order, properties, callback){
	callback = callback || function () {};
	var data = '';
	var commando = require('child_process').spawn(order, properties);
	commando.stderr.on(
		'data',
		function(errorMessage){
			console.log('Error: ' + errorMessage);
		}
	);
	commando.stdout.on(
		'data',
		function(inComingData){
			data += inComingData;
		}
	);
	commando.on(
		'exit',
		function(statusCode){
			if(order == 'll' || order == 'ls' ) {
				var list = [];
				while( data != '' ) {
					list.push(data.substring(0,data.indexOf('\n')));
					data = data.substring(data.indexOf('\n')+1);
				}
				data = list;
			}
			callback(statusCode, data);
		}
	);
	return true;
};


/* --------------------------------------------------------------------------------  
 * --------------------------------------------------------------------------------  
 * function: NodeMinions.prototype.buildPassword
 * 	takes a clearString Password and a UserObject and calculates a salted hash for the password.
 * 
 *	parameters:
 *		passwordString - {string} just a typed-in password (could be any string, so hashing before data-transfer is possible)
 *		userObject - {object} a userObject (straight from the Database at best)
 *
 * returns:
 * 	hash - {string} the created password.  (if something's wrong it will return false.
 * 
 * --------------------------------------------------------------------------------  */
NodeMinions.prototype.buildPassword = function(passwordString, userObject) {
	if (typeof userObject.created !== 'object') {
		if (typeof userObject.createdAt === 'number') {
			userObject.created = { timestamp: userObject.createdAt };
		}
	}
	if (typeof userObject === 'undefined' || typeof passwordString !== 'string' || typeof userObject.created !== 'object' || typeof userObject.created.timestamp !== 'number') return false;
	var myPassword = passwordString + userObject.createdAt + passwordString;
	var hash = require('crypto').createHash('md5').update(myPassword).digest('hex');
	return hash;
};


/* --------------------------------------------------------------------------------  
 * --------------------------------------------------------------------------------  
 * function: NodeMinions.prototype.verifyPassword
 * 	verifys that the given password is the same as the password stored at the user object
 * 
 *	parameters:
 *		passwordString - {string} just a typed-in password (could be any string, so hashing before data-transfer is possible)
 *		userObject - {object} a userObject (straight from the Database at best)
 *
 * returns:
 * 	true or false
 * 
 * -------------------------------------------------------------------------------- */
NodeMinions.prototype.verifyPassword = function(passwordString, userObject) {
  var passwordHash = this.buildPassword(passwordString, userObject);
  return (typeof userObject.password === 'string' && typeof passwordHash === 'string' && userObject.password === passwordHash);
};


NodeMinions.prototype.isWebUser = function(executorAttributes) {
	if (
		typeof VisualWebServer.clients[executorAttributes.publisher.clientId] === 'object'
		&& typeof VisualWebServer.clients[executorAttributes.publisher.clientId].currentUser === 'object'
	)	{
		return true;
	}
	return false;
};
NodeMinions.prototype.getCurrentUser = function(executorAttributes) {
	if (this.isWebUser(executorAttributes) === true) {
		return VisualWebServer.clients[executorAttributes.publisher.clientId].currentUser;
	}
	return VisualWebServer.virtualClients.defaultUser.currentUser;
};
NodeMinions.prototype.isWebAdmin = function(executorAttributes) {
	var cU = this.getCurrentUser(executorAttributes);
	if (
		&& typeof cU.rights === 'object' 
		&& typeof cU.rights.use === 'boolean'		 
		&& cU.rights.use === true 
		&& typeof cU.rights.admin === 'boolean' 
		&& cU.rights.admin === true
	)	{
		return true;
	}
	return false;
};
NodeMinions.prototype.isApiAdmin = function(executorAttributes) {
	if (
		typeof executorAttributes.pubData.apiUser === 'object'
		&& typeof executorAttributes.pubData.apiUser.rights === 'object'
		&& typeof executorAttributes.pubData.apiUser.rights.admin === 'boolean' && executorAttributes.pubData.apiUser.rights.admin === true
		&& typeof executorAttributes.pubData.apiUser.rights.use === 'boolean' && executorAttributes.pubData.apiUser.rights.use === true
		&& (typeof executorAttributes.pubData.apiUser.type === 'number' &&  ( executorAttributes.pubData.apiUser.type === 1 || executorAttributes.pubData.apiUser.type === 2)
		))	{
			return true;
		}
	return false;
};



/* ----------------------------------------------------------------------------
 * -------------- register minions with the system   -----------------------
 * --------------------------------------------------------------------------- 
*/

module.exports = NodeMinions;

;