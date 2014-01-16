var NodeMinions = function() {};

/* --------------------------------------------------------------------------------------
 * method: NodeMinions.prototype.extendFileNameUntilUnique
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
NodeMinions.prototype.extendFileNameUntilUnique = function(originalFilepath, extender, callback) {
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
 *	function: NodeMinions.prototype.getClientAddressFromHttpRequest
 *		[NODEJS] clones an object
 *
 *	parameters:
 *		req - {object} the node http request object
 *
 *	returns:
 *		ip - {string} the ip detected from the request. 0.0.0.0 if detection fails
 * --------------------------------------------------------------------------- */
NodeMinions.prototype.getClientAddressFromHttpRequest = function(req) {
	var ip = '0.0.0.0';
	if (
		typeof req === 'object' 
		&& typeof req.headers === 'object' 
		&& typeof req.headers['x-forwarded-for'] === 'string'
	) {
		ip = req.headers['x-forwarded-for'];
	} else if (
		typeof req === 'object'
		&& typeof req.remoteAddress === 'string'
	) {
		ip = req.remoteAddress;
	}		 else if (
		typeof req === 'object'
		&& typeof req.connection === 'object'
		&& typeof req.connection.remoteAddress === 'string'
	) {
		ip = req.connection.remoteAddress;
	}		
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
		typeof cU.rights === 'object' 
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

/* -----------------------------------------------------------------
 *	function: NodeMinions.prototype.openSocktREPL
 *		opens a TCP socket for connecting to the code console
 *
 *	parameters: 
 *		port - {number} the port on which to listen
 *
 *	returns: 
 * 		TCPServer - {object} the server object
 *
 *	------------------------------------------------------------------*/
NodeMinions.prototype.openSocktREPL = function(serverId, port) {
	var net = require('net');
	var repl = require('repl');
	if (typeof port !== 'number') return null;
	var TCPServer = net.createServer(
		function (socket) {
			repl.start(
				{
					prompt: '[' + serverId + '] > ',
					input: socket,
					output: socket,
					terminal: true,
					userColors: true,
					useGlobal: true
				}
			)
			.on(
				'exit', 
				function() {
					socket.end();
				}
			);
			socket.resume();
		}
	).listen(port);
	console.log('[REPL] listening on port ' + port);
	return TCPServer;
};


/* -----------------------------------------------------------------
 *	function: NodeMinions.prototype.REPLclient
 *		opens a TCP socket to the code console (a REPL server.)
 *
 *	parameters: 
 *		port - {number} the port on to connect
 *
 *	returns: 
 * 		client - {object} the socket client object
 *
 *	------------------------------------------------------------------*/
NodeMinions.prototype.REPLclient = function(port) {
	var net = require('net');
	var client = net.connect(
		{ port: port },
		function() {
			process.stdin.setRawMode(true);
			process.stdin.pipe(client);
			client.pipe(process.stdout);
		}
	);

	client.on('close', function done () {
		process.stdin.setRawMode(false);
		process.stdin.pause();
		client.removeListener('close', done);
	});

	process.stdin.on('end', function () {
		client.destroy();
		console.log();
	});

	process.stdin.on('data', function (b) {
		if (b.length === 1 && b[0] === 4) {
			process.stdin.emit('end');
		}
	});
	return client;
};


/* -----------------------------------------------------------------
 *	function: NodeMinions.prototype.returnFileOnUpdate
 *		will synchronously read and directly return the contents of a file
 *		will also watch that file for changes (see fs.watch for problems)
 *		and trigger the given clalback with the updated file contents
 *		typical use-case is updating template files ...
 *
 *	parameters: 
 *		file - {string} the full file-path for the file you want to watch for updates
 *		callback - {string} the full file-path for the file you want to watch for updates
 *		delay - {number} milliseconds before callback is triggered after a change event. 
 *			this is necessary, because while writing a file multiple change updates a triggered in a row
 *		
 *
 *	returns: 
 * 		content - {string} the file contents
 *
 *	------------------------------------------------------------------*/
NodeMinions.prototype.returnFileOnUpdate = function(file, callback, delay) {
	var myMinions = this;
	if (typeof myMinions.data !== 'object') myMinions.data = {};
	if (typeof myMinions.data.returnFileOnUpdateTimeouts !== 'object') myMinions.data.returnFileOnUpdateTimeouts = {};
	if (typeof delay !== 'number') delay = 3000;
	fs.watch(
		file, 
		function (event, filename) {
			if (event === 'change') {
				if (typeof myMinions.data.returnFileOnUpdateTimeouts[filename] !== 'undefined') clearTimeout(myMinions.data.returnFileOnUpdateTimeouts[filename]);
				myMinions.data.returnFileOnUpdateTimeouts[filename] = setTimeout(
					function() {
						var content = fs.readFileSync(
							file,
							'utf8'
						);
						callback(content);
					},
					delay
				);
			}
		}
	);
	var content = fs.readFileSync(
		file,
		'utf8'
	);
	return content;
};


/* ----------------------------------------------------------------------------
 * -------------- register minions with the system   -----------------------
 * --------------------------------------------------------------------------- 
*/

module.exports = NodeMinions;

;