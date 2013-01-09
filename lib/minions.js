;



var Minions = function(sublibrariesToLoad) {
	if (typeof require === 'function' && typeof sublibrariesToLoad === 'object' && sublibrariesToLoad instanceof Array) {
		var sublibraries = {};
		for (var i=0; i<sublibrariesToLoad.length;i++) {		
			sublibraries[sublibrariesToLoad[i]] = require('./minions.' + sublibrariesToLoad[i]);
			var nextSL = new sublibraries[sublibrariesToLoad[i]]();
			console.log('[minions] loading sublibrary ' + sublibrariesToLoad[i]);
			this.extendShallow(false, this, nextSL);		
		}
	}
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.extendPrototypes
 *		this kind of allows prototypic inheritance with overwriting
 *
 *	parameters:
 *		target - {object} the object that should inherit new prototypes
 *		source - {object} the object that holds prototypes to be copied
 *		doNotOverwrite - {boolean} defaults to false. 
 *			allows you to only copy a prototype if non with that name already exists
 *
 *	returns:
 *		target - {object} the extended target object
 * --------------------------------------------------------------------------- */

Minions.prototype.extendPrototypes = function(target, source, doNotOverwrite) {
	if ( (typeof target === 'undefined' || typeof target.prototype === 'undefined') || (typeof source === 'undefined' || typeof source.prototype === 'undefined')) return target;
	if (typeof doNotOverwrite !== 'boolean') doNotOverwrite = false;
	for (var i in source.prototype) {
		try {
			target.prototype[i] = (doNotOverwrite === true && typeof target.prototype[i] !== 'undefined') ? target.prototype[i] : source.prototype[i];
		} catch(err) {
			console.log(i);
			console.log(source);
			console.log(target);
			console.log(err);
		}
	}
	return target;
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.extendShallow
 *		extends shallow
 *
 *	parameters:
 *		target - {object} the object that should get new property
 *		sourceArray - {array} the objects that holds property to be copied
 *		doNotOverwrite - {boolean} defaults to false. 
 *			allows you to only copy a property if non with that name already exists
 *
 *	returns:
 *		target - {object} the extended target object
 * --------------------------------------------------------------------------- */
Minions.prototype.extendShallow = function(doNotOverwrite, target, sourceArray) {
	if (typeof doNotOverwrite !== 'boolean') doNotOverwrite = false;	
	if (typeof sourceArray !== 'object') sourceArray = {};
	if (sourceArray instanceof Array === false) sourceArray = [ sourceArray ];
	for (var n = 0; n < sourceArray.length; n++) {
		var source = sourceArray[n];
		for (var i in source) {
			target[i] = (doNotOverwrite === true && typeof target[i] !== 'undefined') ? target[i] : source[i];
		}
	}
	return target;
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.extendDeep
 *		extends shallow
 *
 *	parameters:
 *		target - {object} the object that should get new property
 *		sourceArray - {array} the objects that holds property to be copied
 *		doNotOverwrite - {boolean} defaults to false. 
 *			allows you to only copy a property if non with that name already exists
 *
 *	returns:
 *		target - {object} the extended target object
 * --------------------------------------------------------------------------- */
Minions.prototype.extendDeep = function(doNotOverwrite, target, sourceArray) {
	if (typeof doNotOverwrite !== 'boolean') doNotOverwrite = false;	
	if (typeof sourceArray !== 'object') sourceArray = {};
	if (sourceArray instanceof Array === false) sourceArray = [ sourceArray ];
	if (target === null) target = {};
	for (var n = 0; n < sourceArray.length; n++) {
		var source = sourceArray[n];
		for (var i in source) {			
			if (typeof target[i] === 'undefined') {
				target[i] = source[i];
			} else if (
				typeof target[i] === 'function'
				|| typeof target[i] === 'boolean'
				|| typeof target[i] === 'number'
				|| typeof target[i] === 'string'
				|| typeof target[i] !== typeof source[i]		
			) {
				if (doNotOverwrite === false) {
					target[i] = source[i];
				}
			} else if (typeof target[i] === 'object') {
				var sourceIsArray = source[i] instanceof Array;
				var targetIsArray = target[i] instanceof Array;
				if (targetIsArray === true && sourceIsArray === true ) {
					target[i] = target[i].concat(source[i]);
				} else if (targetIsArray !== sourceIsArray && doNotOverwrite === false) {
					target[i] = source[i];
				} else if (targetIsArray === false && sourceIsArray === false) {
					target[i] = this.extendDeep(doNotOverwrite, target[i], [ source[i] ]);
				}
			}
		}
	}
	return target;
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.objectSize
 *		this kind of allows prototypic inheritance with overwriting
 *
 *	parameters:
 *		obj - {object} the object that should be counted
 *
 *	returns:
 *		n - {integer} the number of properties
 * --------------------------------------------------------------------------- */
Minions.prototype.objectSize = function(obj) { 
	if (typeof obj !== 'object') return -1;
	var n = 0;
	for (var i in obj) {
		if (obj.hasOwnProperty(i)) n++;
	}
	return n;
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.objectCompare
 *		compares two objects
 *
 *	parameters:
 *		a - {object} the object that should be compared to b
 *		b - {object} the object that should be compared to a
 *
 *	returns:
 *		n - {integer} the number of properties
 * --------------------------------------------------------------------------- */
// adapted from : http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
Minions.prototype.objectCompare = function(a, b) {
  var p;
  for (p in a) {
      if (typeof(b[p]) === 'undefined') {
				return false;
			}
  }
  for (p in a) {
		if (a[p]) {
			switch(typeof a[p]) {
				case 'object':
					if (this.objectCompare(a[p], b[p]) === false) { 
						return false; 
					} 
					break;
				case 'function':
					if (typeof b[p] === 'undefined' ||
							(a[p].toString() !== b[p].toString()))
							return false;
					break;
				default:
					if (a[p] !== b[p]) { 
						return false; 
					}
			}
		} else {
			if (b[p]) {
				return false;
			}
		}
  }
  for (p in b) {
		if (typeof a[p] === 'undefined') {
			return false;
		}
  }
  return true;
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.getDomainFromUrl
 *		gets the domain out of a url string
 *
 *	parameters:
 *		url - {string} a url string
 *
 *	returns:
 *		domain - {string} the domain part of the passed in url
 * --------------------------------------------------------------------------- */
Minions.prototype.getDomainFromUrl = function(url) {
	if (typeof url !== 'string') return '';
	var a = url.split('//');
	var b = (a.length > 1) ? a[1] : a[0];
	var c = b.split('www.');
	var d = (c.length > 1) ? c[1] : c[0];
	if (typeof d !== 'string') d = '';
	var domain = (d.indexOf('/') > -1) ? d.substr(0,d.indexOf('/')) : d;
	return domain;
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.cloneObject
 *		clones an object
 *
 *	parameters:
 *		sourceObject - {object} the object to be cloned
 *
 *	returns:
 *		clone - {object} the clone
 * --------------------------------------------------------------------------- */
Minions.prototype.cloneObject = function(sourceObject) { 
	var clone = {};
	for (var i in sourceObject) {
		clone[i] = sourceObject[i];
	}
	return clone;
};


// --> renamed makeId -> randomString
// --> changed parameters ! only length (the first) is still okay !
/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.randomString
 *		creates a random string - naming is weird. this library is WEIRD ;)
 *
 *	parameters:
 *		length - {integer} defaults to 8. number of chars in the generated id
 *		numbers - {boolean} should numbers be in the id ?
 *		alphabet - {boolean} should alphabetical chars be in the id ?
 *		timestamp - {boolean} should a timestamp (ms since linux...) be at the start of the id? (not counted against length)
 *				adding a timestamp is slow, but a pretty good means to make your string utterly unique
 *
 *	returns:
 *		id - {string} the random id generated
 * --------------------------------------------------------------------------- */
Minions.prototype.randomString = function(length, numbers, alphabet, timestamp) {		
	// version TW 24.11.2012 14.00
	var id = '';
	if (typeof numbers !== 'boolean') numbers = true;
	if (typeof alphabet !== 'boolean') alphabet = false;
	if (typeof timestamp !== 'boolean') timestamp = false;
	if (alphabet === false && numbers === false) {
		numbers = true;
		alphabet = true;
		timestamp = true;
	}
	if (timestamp === true) id += new Date().getTime();
	if (timestamp === true && alphabet === false && numbers === false) return id;	
	var chars_alphabet = new Array('a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z');
	var chars_numbers = new Array('1','2','3','4','5','6','7','8','9','0');
	var chars_both = new Array('1','2','3','4','5','6','7','8','9','0', 'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z');
	if (numbers === true && alphabet === false) {
		var idchars = chars_numbers;
	} else if (numbers === true && alphabet === true) {
		var idchars = chars_both;
	} else if (numbers === false && alphabet === true) {
		var idchars = chars_alphabet;
	}
	for (var i=0; i < length; i++) {
		id += idchars[Math.floor(Math.random()*idchars.length)];
	}
	return id;
};


/* --------------------------------------------------------------------------------  
 * function: Minions.prototype.exceptionHandler
 * 	handles exceptions and generates some output 
 * 
 *	parameters:
 *		err - {Error} a Javascript Error Object
 *		data - {object} data about the error...
 *
 * returns:
 * 	true
 * 
 * --------------------------------------------------------------------------------  */
Minions.prototype.exceptionHandler = function(err, data) {
	if (typeof data === 'undefined') data = '[none]';
	console.log('[--ERROR--]');
	if (typeof err.stack !== 'undefined') {
		console.log(err.stack);		
	}
	if (typeof VisualWebServer === 'object') {
		VisualWebServer.errors.push(err);
		if (VisualWebServer.errors.length > 100) VisualWebServer.errors.shift();
	} else if (typeof VisualWebClient === 'object') {
		VisualWebClient.errors.push(err);
		if (VisualWebClient.errors.length > 100) VisualWebClient.errors.shift();
	}
	return true;
};


/* --------------------------------------------------------------------------------------
 * method: Minions.prototype.isArray
 * 	checks a variable for being an Array. inspired by jQuery
 * 
 *	parameters:
 *		thing - {any} the variable to be checked
 *
 * returns:
 * 	isArray - {boolean} is thing an array or not?.
 * 
 * -------------------------------------------------------------------------------------- */
Minions.prototype.isArray = function(thing) { if (typeof thing !== 'object') return false; return ( thing instanceof Array); };


/* --------------------------------------------------------------------------------------
 * method: Minions.prototype.isFunction
 * 	checks a variable for being a Function. inspired by jQuery
 * 
 *	parameters:
 *		thing - {any} the variable to be checked
 *
 * returns:
 * 	isFunction - {boolean} is thing a function or not?.
 * 
 * -------------------------------------------------------------------------------------- */
Minions.prototype.isFunction = function(thing) { return (typeof thing === 'function'); };


/* --------------------------------------------------------------------------------------
 * method: Minions.prototype.isNumeric
 * 	checks a variable for being a Number. inspired by jQuery
 * 
 *	parameters:
 *		thing - {any} the variable to be checked
 *
 * returns:
 * 	isNumeric - {boolean} is thing a Number or not?.
 * 
 * -------------------------------------------------------------------------------------- */
Minions.prototype.isNumeric = function(thing) { return !isNaN( parseFloat(thing) ) && isFinite( thing ); };


/* --------------------------------------------------------------------------------------
 * method: Minions.prototype.isEmail
 * 	checks a variable for being a eMail.
 * 
 *	parameters:
 *		thing - {any} the variable to be checked
 *
 * returns:
 * 	isEmail - {boolean} is thing a email or not?.
 * 
 * -------------------------------------------------------------------------------------- */
Minions.prototype.isEmail = function(email) { 
	// test for variable type
	if (typeof email !== 'string') {
		return false;
	}
	// test for variable length
	if (email.length < 6 || email.length > 80) {
		return false;
	}
	// test for email format
	var emailFormat = /^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
	return emailFormat.test(email);
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.distance2D
 *		i don't remember where this came from, but i copied it from the net ;) sorry and thanks to the author
 *		rather simply geometry... this calculates the distance between two points in a 2dimensional grid.
 *
 *	parameters:
 *		x1 - {integer}
 *		y1 - {integer}
 *		x2 - {integer}
 *		y2 - {integer} 
 *
 *	returns:
 *		distance - {integer} the distance between both points
 * --------------------------------------------------------------------------- */
Minions.prototype.distance2D = function(x1, y1, x2, y2) {
	//     ______________________
	//d = &#8730; (x2-x1)^2 + (y2-y1)^2
	//
	//Our end result
	var distance = 0;
	//Take x2-x1, then square it
	var part1 = Math.pow((x2 - x1), 2);
	//Take y2-y1, then sqaure it
	var part2 = Math.pow((y2 - y1), 2);
	//Add both of the parts together
	var underRadical = part1 + part2;
	//Get the square root of the parts
	distance = Math.sqrt(underRadical);
	//Return our result
	return distance;
};


/* --------------------------------------------------------------------------------------
 * class: Minions.prototype.objectFilter
 * 	instantiates a new objectFilter to manipulate other objects
 * 
 *	parameters:
 *		newConfig - {object} a userObject (straight from the Database at best)
 *
 * (code start)
 an example: 
 
var testObj = {
	a:1,
	b:'testString',
	c: {
			c1: 'cc1',
			c2: 333,
			c3: function() { return 0; }
	},
	d: ['x','y','z'],
	e: function() { return 1;}                
};
var f = {
	attributesToFilter: { 
		a: function(data) { return data; },
		b: true,
		c: function(data) {
				var filtered = {};
				filtered['c1'] = data.c1;
				filtered['c2'] = data.c2 + data.c2;
				return filtered;
		}, 
		d: false
	},
	returnUnfilteredAttributes: true,
	attributesToAdd: {
		funAttribute: function(sourceObject) { return sourceObject.a + sourceObject.c.c2; }
	}
};
var filter1 = new minions.objectFilter(f);
console.log(filter1.run(testObj));	
* (end)
 *
 * returns:
 * 	this - {object} itself, for chaining.
 * 
 * --------------------------------------------------------------------------------------*/
Minions.prototype.objectFilter = function(newConfig) {
	this.config = this.defaultFilterSettings();
	if (typeof newConfig === 'object') {
		for (var key in newConfig) this.config[key] = newConfig[key];
	}
	return this;
};
/* --------------------------------------------------------------------------------------
 * class: Minions.prototype.objectFilter.prototype.defaultFilterSettings
 * 	the default filterObject configuration. three major attributes can be configured:
 *			attributesToFilter - {object} list attribute names to filter coupled to a boolean (copy or not) or a function for advanced filtering
 *			returnUnfilteredAttributes - {boolean} decides whether attributes that are not listed in the attributesToFilter will be copied or not
 *			attributesToAdd - {object} list of attribute names that will be added and a coupled function that will receive the complete source object
 * 
 *	parameters:
 *		
 *
 *	returns:
 *		defaultConfig - {object} your filter config
 *
 * -------------------------------------------------------------------------------------- */
Minions.prototype.objectFilter.prototype.defaultFilterSettings = function() {
	var defaultConfig = {
		attributesToFilter: {},
		returnUnfilteredAttributes: true,
		attributesToAdd: {}
	};
	return defaultConfig;
};
/* --------------------------------------------------------------------------------------
 * method: Minions.prototype.objectFilter.prototype.run
 * 	returns selected attributes of an Object according to the filter's settings
 * 
 *	parameters:
 *		sourceObject - {object} a object to be filtered
 *
 * returns:
 * 	resultObject - {object} the filtered userObject.
 * 
 * -------------------------------------------------------------------------------------- */
Minions.prototype.objectFilter.prototype.run = function(sourceObject) {
	if (typeof sourceObject !== 'object') return false;
	var filter = this.config.attributesToFilter;
	var resultObject = {};
	for (var key in sourceObject) resultObject[key] = sourceObject[key];
	for (var key in resultObject) {
		if (typeof resultObject[key] === 'undefined') resultObject[key] = '{undefined}';
		if (typeof resultObject[key] === 'function') resultObject[key] = '{function}';
		if (typeof filter[key] === 'undefined') {
			if (this.config.returnUnfilteredAttributes === false) {
				resultObject[key] = void 0;
			}
			continue;
		}
		if (typeof filter[key] === 'boolean' && filter[key] === true) {
			continue;
		}
		if (typeof filter[key] === 'boolean' && filter[key] === false) {
			resultObject[key] = void 0;
			continue;
		}
		if (typeof filter[key] === 'function') {
			resultObject[key] = filter[key](resultObject[key]);                    
			continue;
		}
	}
	for (var newAttName in this.config.attributesToAdd) {
		if (typeof this.config.attributesToAdd[newAttName] === 'function') continue;
		resultObject[newAttName] = this.config.attributesToAdd[newAttName](sourceObject);
	}
	return resultObject;
};


/* --------------------------------------------------------------------------------------
 * method: Minions.prototype.preExtendFileName
 * 	add an extender string to the beginning of a filename (filename potentially including a path)
 * 
 *	parameters:
 *		originalFilepath - {string}
 *		extender - {string||function||number}
 *
 * returns:
 * 	newFilePath - {string} the resulting filename (incl path)
 * 
 * -------------------------------------------------------------------------------------- */
Minions.prototype.preExtendFileName = function(originalFilepath, extender) {
	var lastSlash = originalFilepath.lastIndexOf('/');
	var fileToSlash = originalFilepath.substr(0, lastSlash+1);
	var fileName = originalFilepath.substr(lastSlash+1);
	var myExtender = (typeof extender === 'function') ? extender(fileName) : extender;
	var newFilePath = fileToSlash + myExtender + fileName;
	return newFilePath;
};


/* --------------------------------------------------------------------------------------
 * method: Minions.prototype.extendFileName
 * 	add an extender string to the end of a filename (filename potentially including a path) - without altering the file-extension
 * 
 *	parameters:
 *		originalFilepath - {string}
 *		extender - {string||function||number}
 *
 * returns:
 * 	newFilePath - {string} the resulting filename (incl path)
 * 
 * -------------------------------------------------------------------------------------- */
Minions.prototype.extendFileName = function(originalFilepath, extender) {
	var lastDot = originalFilepath.lastIndexOf('.');
	var fileToDot = originalFilepath.substr(0, lastDot - 1);
	var fileExtension = originalFilepath.substr(lastDot);
	var myExtender = (typeof extender === 'function') ? extender(fileName) : extender;
	var newFilePath = fileToDot + myExtender + fileExtension;
	return newFilePath;
};


/* --------------------------------------------------------------------------------------
 * method: Minions.prototype.makePathRelativeTo
 * 	take a filepath and return it relative to a base-path.
 * 
 *	parameters:
 *		filePath - {string}
 *		basePath - {string}
 *
 * returns:
 * 	filePath - {string}
 * 
 * -------------------------------------------------------------------------------------- */
Minions.prototype.makePathRelativeTo = function(filePath, basePath) {
	var dubSlash = new RegExp('//', 'gi');
	filePath = filePath.replace(dubSlash,'/');
	var baseParts = basePath.split('/');
	for (var i = 0; i < baseParts.length; i++) {
		if (filePath.indexOf(baseParts[i] + '/') === 0) {
			filePath = filePath.substr(baseParts[i].length);
		} else if (filePath.indexOf('/' + baseParts[i]) === 0) {
			filePath = filePath.substr(baseParts[i].length + 1);
		}
	}
	if (filePath.indexOf('/') > 0) filePath = '/' + filePath;
	return filePath;
};


/* --------------------------------------------------------------------------------------
 * method: Minions.prototype.extendFileNameUntilUnique
 * 	take a filepath and return it relative to a base-path.
 * 
 *	parameters:
 *		filePath - {string}
 *		basePath - {string}
 *
 * returns:
 * 	filePath - {string}
 * 
 * -------------------------------------------------------------------------------------- */
Minions.prototype.makePathAbsoluteTo = function(filePath, basePath) {
	// TODO MAKE THIS INDEPENDENT OF VisualWebServer object!!!
	var relFilePath = this.makePathRelativeTo(filePath, basePath);
	filePath = basePath + relFilePath;
	var dubSlash = new RegExp('//', 'gi');
	filePath = filePath.replace(dubSlash,'/');
	return filePath;
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.limit
 *		puts a number between upper and lower limits if those were exceeded
 *
 *	parameters:
 *		number - {number}
 *		lowerLimit - {number}
 *		upperLimit - {number}
 *
 *	returns:
 *		limited - {number} the result.
 * --------------------------------------------------------------------------- */
Minions.prototype.limit = function(number, lowerLimit, upperLimit) {
	if (typeof number !== 'number' || typeof lowerLimit !== 'number' || typeof upperLimit !== 'number') return -1;
	if (number < lowerLimit) return lowerLimit;
	if (number > upperLimit) return upperLimit;
	return number;
};


/* --------------------------------------------------------------------------	
 *	function: Minions.prototype.tagsToString
 *		returns a string made from the tags object/array of a link
 *
 *	parameters:
 *		tags - {object||array} the tags object/array
 *
 *	returns:
 *		tagString - {string} tags attribute converted into a string
 * --------------------------------------------------------------------------- */
Minions.prototype.tagsToString = function(tags) {
	if (typeof tags !== 'object') return '';
	if (tags instanceof Array) return tags.toString();
	var tagString = '';
	for (var i in tags) {
		tagString += tags[i] + ', ';
	}
	tagString = tagString.substr(0, tagString.length -2);
	return tagString;
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.now
 *		gets the local machine's current time since unix start (1970 something?)
 *
 *	parameters:
 *		getSeconds - {boolean} defaults to false. if true the return value will be seconds instead of milliseconds.
 *
 *	returns:
 *		ms - {integer} the current time in milliseconds (or seconds if parameter is given).
 * --------------------------------------------------------------------------- */
Minions.prototype.now = function(getSeconds) {
	var ms = new Date().getTime();
	if (getSeconds) return ms/1000;
	return ms;
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.secondsRunning
 *		calculates the passed milliseconds since the application was started 
 *
 *	returns:
 *		sR - {integer} the milliseconds that passed since the application was launched
 * --------------------------------------------------------------------------- */
Minions.prototype.secondsRunning = function() {
	var ms = this.now();
	if (typeof VisualWebClient === 'object') {
		var ms_difference = ms - VisualWebClient.data.LaunchTime;
	} else if (typeof VisualWebServer === 'object') {
		var ms_difference = ms - VisualWebServer.data.LaunchTime;
	}
	var sR = Math.round(ms_difference/1000);
	return sR;
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.setObjectAttrByString
 *    setting an object attribute with a dot separated string for nested objects
 *    taken from http://stackoverflow.com/a/9336338
 *
 *	parameters:
 *		obj - the object we want to access
 *		keyString - the attribute we want to set
 *    val - the value we want to set
 *
 *	returns:
 *		attribute or nothing
 * --------------------------------------------------------------------------- */
Minions.prototype.setObjectAttrByString = function(obj, keyString, val) {
	for (var keys = keyString.split('.'), i = 0, l = keys.length; i < l - 1; i++) {
		obj = obj[keys[i]];
		if (obj === 'undefined') return void 0;
	}
	if (obj[keys[l - 1]] === 'undefined') return void 0;
	obj[keys[l - 1]] = val;
	return val;
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.getObjectAttrByString
 *    accessing an object attribute with a dot separate string for nested objects
 *    taken from http://stackoverflow.com/a/9336338
 *
 *	parameters:
 *		obj - the object we want to access
 *		keyString - the attribute we want to get
 *
 *	returns:
 *		attribute or nothing
 * --------------------------------------------------------------------------- */
Minions.prototype.getObjectAttrByString = function(obj, keyString) {
  for (var keys = keyString.split('.'), i = 0, l = keys.length; i < l; i++) {
    obj = obj[keys[i]];
    if (obj === 'undefined') return void 0;
  }
  return obj;
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.colorToHex
 *		external code snippet that converts a rgb color string to Hex
 *		<http://haacked.com/archive/2009/12/29/convert-rgb-to-hex.aspx> 
 *
 *	parameters:
 *		color - {string} the rgb color string that should be converted 
 *
 *	returns:
 *		hexColor - {string} the hex code represented the passed in rgb color
 * --------------------------------------------------------------------------- */
Minions.prototype.colorToHex = function(color) {   // taken from this http://haacked.com/archive/2009/12/29/convert-rgb-to-hex.aspx
	if (typeof color === 'undefined' || color === '') return '#000000';
	if (color.substr(0, 1) === '#') {
		return color;
	}
	var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);
	if (typeof digits === 'undefined' || digits === '' || digits == null) return '#000000';
	var red = parseInt(digits[2]);
	var green = parseInt(digits[3]);
	var blue = parseInt(digits[4]);	
	var rgb = blue | (green << 8) | (red << 16);
	return digits[1] + '#' + rgb.toString(16);
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.jsDateFromMysql
 *		function parses mysql datetime string and returns javascript Date object
 *		input has to be in this format: 2007-06-05 15:26:02
 *		<http://snippets.dzone.com/posts/show/4132>
 *
 *	parameters:
 *		timestamp - {string} a mysql formatted datetime string 
 *
 *	returns:
 *		date - {Date} the javascript date object representation of the passed in mySQL date
 * --------------------------------------------------------------------------- */
Minions.prototype.jsDateFromMysql = function(timestamp) {
	// got this from http://snippets.dzone.com/posts/show/4132
	if (typeof timestamp === 'undefined') timestamp = '0000-00-00 00:00:00';
	var regex=/^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/;
	var parts=timestamp.replace(regex,"$1 $2 $3 $4 $5 $6").split(' ');
	return new Date(parts[0],parts[1]-1,parts[2],parts[3],parts[4],parts[5]);
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.jsDateToMysql 
 *		converts a javascript date object into a mySQL timestamp string
 *
 *	parameters:
 *		myTime - {string} optional. the datetime you want converted. defaults to the current datetime 
 *
 *	returns:
 *		mysqlDateTime - {string} the mySQL format of the passed in timestamp
 * --------------------------------------------------------------------------- */
Minions.prototype.jsDateToMysql = function(myTime) {
	var date = new Date();
	if (typeof myTime !== 'undefined') date.setTime(myTime);
	var yyyy = date.getFullYear();
	var mm = date.getMonth() + 1;
	var dd = date.getDate();
	var hh = date.getHours();
	var min = date.getMinutes();
	var ss = date.getSeconds();
	var mysqlDateTime = yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + min + ':' + ss;
	return mysqlDateTime;
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.getFirstObjectAttribute
 *		a super-simple (and probably badly coded) method that returns the name of the first attribute/key in an object
 *
 *	parameters:
 *		obj - {object} the object to be used.
 *
 *	returns:
 *		first - {string} the name of the first attribute of the given object.
 * --------------------------------------------------------------------------- */
Minions.prototype.getFirstObjectAttribute = function(obj) {
	var first;
	for (var i in obj) {
		if (obj.hasOwnProperty(i) && typeof first !== 'function') {
			first = obj[i];
			break;
		}
	}
	return first;
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.getNextObjectAttribute
 *		this methods finds and returns the attribute that is listed after the attribute you pass.
 *		this method is handy for navigating an object (key-named array).
 *		it will jump over the end (if given the last attribute's name as a starting point) and return the first
 *
 *	parameters:
 *		obj - {object} the object to work with
 *		attName - {string} the name of the starting attribute. the one after it will be returned. 
 *
 *	returns:
 *		next - {string} the name of the 'next' key/attribute
 * --------------------------------------------------------------------------- */
Minions.prototype.getNextObjectAttribute = function(obj, attName) {
	var first = false;
	var returnNext = false;
	var found = false;
	var next = false;
	for (var i in obj) {
		if (first == false) {
			first = {};
			first[i] = obj[i];
		}
		if (returnNext) {
			next = {i: obj[i]};
			found = true;
			break;
		}
		if (i == attName) {
			returnNext = true;
		}
	}
	if (returnNext == true && found == false) {
		next = first;
	}
	return next;
};


/* -----------------------------------------------------------------
 *	function: Minions.prototype.getUrlParameterByName
 *		[BROWSER] extracts parameters from the url by name
 *
 *	parameters: 
 *		name - {string} the name of the parameter to extract
 *
 *	returns: 
 * 	parameters - {array} list of the parameters matching the given name
 *
 *	------------------------------------------------------------------*/
Minions.prototype.getUrlParameterByName = function(name) {  
// from http://stackoverflow.com/questions/901115/get-query-string-values-in-javascript
	name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
	var regexS = '[\\?&]' + name + '=([^&#]*)';
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.search);
	if (results == null) {
		return [];
	} else {
		return [ decodeURIComponent(results[1].replace(/\+/g, ' ')) ];
	}
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.foundIn
 *		allows iterating over an object until a callback returns true; 
 *
 *	parameters:
 *		obj - {object} the object to be iterated over. 
 *		checkfunc - {function} the function to be called for each attribute of the passed object. the function will get the value of the respective object-attribute (= obj[attribute] ) for evaluation. the for-loop will exit if the given function returns true is returned.
 *
 *	returns:
 *		result - {object||boolean} false if checkfunc did not return true for any attribute or if any of the parameters were corrupt. otherwise the value of the object's first true-evaluated attribute will be returned. (NOT the name and ONYL the first hit!)
 * --------------------------------------------------------------------------- */
Minions.prototype.foundIn = function(obj, checkfunc) {
	if (typeof obj !== 'object') return false;
	if (typeof checkfunc !== 'function') return false;
	for (var key in obj) {
		if (checkfunc(obj[key])) return obj[key];
	}
	return false;
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.fitIntoBox
 *		this function will optimally fit a rectangular object with variable w/h into a Box-Area considering the aspect ratios.
 *
 *	parameters:
 *		ObjectSize - {object} contains .w and .h attributes which need to be {integer}s
 *		BoxSize - {object} contains .w and .h attributes which need to be {integer}s 
 *
 *	returns:
 *		newDimensions - {object} contains .w and .h attributes with the new Dimensions
 * --------------------------------------------------------------------------- */
Minions.prototype.fitIntoBox = function(ObjectSize,BoxSize) {
	var newDim = {
		h:0,
		w:0
	};
	if (
		typeof ObjectSize === 'undefined' || typeof ObjectSize.w !== 'number' || typeof ObjectSize.h !== 'number'
		|| typeof BoxSize === 'undefined' || typeof BoxSize.w !== 'number' || typeof BoxSize.h !== 'number'
	) {
		return newDim;
	}
	var W_limiting = (BoxSize.w/ObjectSize.w < BoxSize.h/ObjectSize.h) ? true : false;
	if (W_limiting === true) {
		newDim.w = BoxSize.w;
		newDim.h = ObjectSize.h*(BoxSize.w/ObjectSize.w);
	} else {
		newDim.h = BoxSize.h;
		newDim.w = ObjectSize.w*(BoxSize.h/ObjectSize.h);
	}
	return newDim;
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.Array_setFirstElement
 *		re-arranges an array by moving a specific element to the top.
 *
 *	parameters:
 *		o_array - {array||object} the array/object to re-sort
 *		IndexOfFirst - {number||string} the key of the attribute that should become the new top attribute 
 *
 *	returns:
 *		tmpArray - {array||object} the re-arranged array or object.
 * --------------------------------------------------------------------------- */
Minions.prototype.Array_setFirstElement = function(o_array,IndexOfFirst) {
	var tmpArray = new Array();
	if (typeof o_array === 'undefined' || o_array.length == 0) return tmpArray;
	if (IndexOfFirst < o_array.length) {
		for (var i = IndexOfFirst; i<o_array.length; i++) {
			if (typeof o_array[i] !== 'undefined') tmpArray.push(o_array[i]);
		}
	}
	for (var i = 0; i<IndexOfFirst; i++) {
		if (typeof o_array[i] !== 'undefined') tmpArray.push(o_array[i]);
	}
	return tmpArray;
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.trim
 *		standard string trim function
 *
 *	parameters:
 *		str - {string} the string to trim
 *		chars - {array} the chars to remove from both ends. defaults to SPACE 
 *
 *	returns:
 *		result - {string} the trimmed string
 * --------------------------------------------------------------------------- */
Minions.prototype.trim = function(str, chars) {
    return this.ltrim(this.rtrim(str, chars), chars);
};
  

/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.ltrim
 *		standard string ltrim function
 *
 *	parameters:
 *		str - {string} the string to ltrim
 *		chars - {array} the chars to remove from the left end. defaults to SPACE 
 *
 *	returns:
 *		result - {string} the trimmed string
 * --------------------------------------------------------------------------- */
Minions.prototype.ltrim = function(str, chars) {
    chars = chars || "\s";
    return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
};
  

/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.rtrim
 *		standard string rtrim function
 *
 *	parameters:
 *		str - {string} the string to rtrim
 *		chars - {array} the chars to remove from the right end. defaults to SPACE 
 *
 *	returns:
 *		result - {string} the trimmed string
 * --------------------------------------------------------------------------- */
Minions.prototype.rtrim = function(str, chars) {
    chars = chars || "\s";
    return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
};


// !! nameChange array_keys -> objectKeys
/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.objectKeys
 *		find and return all the keys/attributeNames of an object
 *
 *	parameters:
 *		anObject - {object} the object to iterate over 
 *
 *	returns:
 *		keys - {array} the list of found keys
 * --------------------------------------------------------------------------- */
Minions.prototype.objectKeys = function(anObject) {
	var keys = [];
	if (typeof anObject !== 'object') return keys;
	for (var i in anObject) {
		keys.push(i);
	}
	return keys;
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.stripNonNumeric
 *		 removes non-numeric characters 
 *
 *	parameters:
 *		str - {string} the string to clean/strip  
 *
 *	returns:
 *		out - {string} the resulting string (not a parseInt!)
 * --------------------------------------------------------------------------- */
Minions.prototype.stripNonNumeric = function(str) {
	str += '';
	var rgx = /^\d|\.|-$/;
	var out = '';
	for( var i = 0; i < str.length; i++ ) {
		if (rgx.test(str.charAt(i))) {
			if (!((str.charAt(i) == '.' && out.indexOf( '.' ) != -1 ) || ( str.charAt(i) == '-' && out.length != 0 ) ) ) {
				out += str.charAt(i);
			}
		}
	}
	return out;
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.stripHTML
 *		 removes html (and xml .. and everything between < >) from a string
 *
 *	parameters:
 *		str - {string} the string to clean/strip  
 *
 *	returns:
 *		stripped - {string} the resulting string 
 * --------------------------------------------------------------------------- */
Minions.prototype.stripHTML = function(str) {
	if (typeof str !== 'string') return false;
	var stripped = str.replace(/<(?:.|\n)*?>/gm, '');
	return stripped;
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.stripQuotes
 *		 removes ' and " from a string
 *
 *	parameters:
 *		str - {string} the string to clean/strip  
 *
 *	returns:
 *		stripped - {string} the resulting string 
 * --------------------------------------------------------------------------- */
Minions.prototype.stripQuotes = function(str) {
	if (typeof str !== 'string') return false;
	var stripped = str.replace(/"'/gm, '');
	return stripped;
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: Minions.prototype.adjustNumber
 *		this function is copied from the web. sorry for not including the url - simply forgot to :(
 * 		Formats the number according to the ‘format’ string;
 * 		adherses to the american number standard where a comma
 * 		is inserted after every 3 digits.
 *  	note: there should be only 1 contiguous number in the format,
 * 		where a number consists of digits, period, and commas
 *       any other characters can be wrapped around this number, including ‘$’, ‘%’, or text
 *
 *	parameters:
 *		number - {integer} the number to format
 *		format - {string} the fomatting style:
 *			examples (123456.789):
 *          ‘0' - (123456) show only digits, no precision
 *          ‘0.00' - (123456.78) show only digits, 2 precision
 *          ‘0.0000' - (123456.7890) show only digits, 4 precision
 *          ‘0,000' - (123,456) show comma and digits, no precision
 *          ‘0,000.00' - (123,456.78) show comma and digits, 2 precision
 *          ‘0,0.00' - (123,456.78) shortcut method, show comma and digits, 2 precision
 *
 *	returns:
 *		result - {string} the formatted number
 * --------------------------------------------------------------------------- */
Minions.prototype.adjustNumber = function(number, format) {
	if (typeof format !== 'string') return ''; 
	var 
		hasComma = -1 < format.indexOf(','),
		psplit = this.stripNonNumeric(format).split('.'),
		that = number; 
	// compute precision
	if (1 < psplit.length) {
		// fix number precision
		that = that.toFixed(psplit[1].length);
	}
	// error: too many periods
	else if (2 < psplit.length) {
		return('NumberFormatException: invalid format, formats should have no more than 1 period: ' + format);
	}
	// remove precision
	else {
		that = that.toFixed(0);
	}
	// get the string now that precision is correct
	var fnum = that.toString();
	// format has comma, then compute commas
	if (hasComma) {
		// remove precision for computation
		psplit = fnum.split('.');
		var 
			cnum = psplit[0],
			parr = [],
			j = cnum.length,
			m = Math.floor(j / 3),
			n = cnum.length % 3 || 3; // n cannot be ZERO or causes infinite loop 

		// break the number into chunks of 3 digits; first chunk may be less than 3
		for (var i = 0; i < j; i += n) {
			if (i != 0) {n = 3};
			parr[parr.length] = cnum.substr(i, n);
			m -= 1;
		} 

		// put chunks back together, separated by comma
		fnum = parr.join(',');
		// add the precision back in
		if (psplit[1]) {fnum += '.' + psplit[1]};
	} 
	// replace the number portion of the format with fnum
	return format.replace(/[\d,?\.?]+/, fnum);
};


// --> renamed aResourceWaiter -> runUponConditionsMet
/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	object: Minions.prototype.runUponConditionsMet
 *		 a tiny helper class that will allow checking a series of conditions before executing something
 *
 * --------------------------------------------------------------------------- */
Minions.prototype.runUponConditionsMet = function(conditions, executeIfAllGood, executeIdNotAllGood) {
	if (typeof conditions !== 'object' || typeof executeIfAllGood !== 'function') return 'bad format';
	this.conditions = conditions;
	this.results = [];
	for (var i in this.conditions) this.results[i] = false;
	this.executeIfAllGood = (typeof executeIfAllGood === 'function') ? executeIfAllGood : function() { return null; };
	this.executeIdNotAllGood = (typeof executeIdNotAllGood === 'function') ? executeIdNotAllGood : function() { return null; };
	return this;
};
Minions.prototype.runUponConditionsMet.prototype.runChecks = function() {
	var allGood = true;
	for (var i in this.conditions) {
		if (this.results[i] == true) continue;
		if (typeof this.conditions[i] === 'function') {
			this.results[i] = this.conditions[i]();
			if (this.results[i] == false) {
				allGood = false;
			}
		}		
	}
	if (allGood === true) {
		this.executeIfAllGood();
		return true;
	} else {
		this.executeIdNotAllGood();
		return false;
	}
};


/* -----------------------------------------------------------------
 *	class: Minions.prototype.runOncePer
 *		this class allows you to trigger a function n-times, but only run it oncePer time/number of calls, ...
 *
 *	parameters: 
 *		callback - {function the callback you want to run 
 *		delay - {integer} the delay in milliseconds before callback is executed.
 *		resetOnRecall - {boolean} defaults to true. if called again before delay is done, should delay be reset to 0 or simply continue?
 *		isInterval - {boolean} defaults to false. if you want to execute the callback not once, but in intervals set this to true.
 *		scope - {object} defaults to this (the runOncePer instance). the scope to apply to the callback
 *		
 *	returns: 
 * 	this - {object}
 *
 *	------------------------------------------------------------------*/
Minions.prototype.runOncePer = function(callback, delay, resetOnRecall, isInterval, scope, callbackParameters) {
	this.scope = (typeof scope == 'object') ? scope : this;
	this.runs = 0;
	this.delay = delay;
	this.resetOnRecall = (typeof resetOnRecall === 'boolean') ? resetOnRecall : true;
	this.status = 'initialized';
	this.type = (isInterval) ? 'interval' : 'timeout';
	this.callback = callback;
	this.callbackParameters = (typeof callbackParameters === 'object' && callbackParameters instanceof Array) ? callbackParameters : [];
	return this;
};
/* -----------------------------------------------------------------
 *	method: Minions.prototype.runOncePer.prototype.execute
 *		executes the callback. used internally. use <VisualWebClient.funcs.runOncePer.prototype.run> from the outside!
 *
 *	parameters: 
 *		thisOnce - {object} the own instance ... necessary due to scope changes ...
 *		
 *	returns: 
 * 	thisOnce - {object} the local scope
 *
 *	------------------------------------------------------------------*/
Minions.prototype.runOncePer.prototype.execute = function(thisOnce) {
	thisOnce.executions++;
	try {
		thisOnce.callback.apply(thisOnce.scope, thisOnce.callbackParameters);
	} catch (err) {
		console.log(err);
	}
	if (thisOnce.type === 'timeout') {
		thisOnce.status = 'finished';
	}
	return thisOnce;
};
/* -----------------------------------------------------------------
 *	method: Minions.prototype.runOncePer.prototype.run
 *		this is the function to call in as a trigger
 *
 *	parameters: 
 *		
 *	returns: 
 * 	thisOnce - {object} the local scope
 *
 *	------------------------------------------------------------------*/
Minions.prototype.runOncePer.prototype.run = function() {
	var thisOnce = this;
	if (thisOnce.status === 'running') {
		if (thisOnce.resetOnRecall) {
			thisOnce.stop().start();			
		}
	} else {
		thisOnce.stop().start();
	}	
	return thisOnce;
};
/* -----------------------------------------------------------------
 *	method: Minions.prototype.runOncePer.prototype.start
 *		starts the timer
 *
 *	parameters: 
 *		
 *	returns: 
 * 	thisOnce - {object} the local scope
 *
 *	------------------------------------------------------------------*/
Minions.prototype.runOncePer.prototype.start = function() {
	var thisOnce = this;
	if (thisOnce.type === 'interval') {
		thisOnce.timerId = setInterval(function() { thisOnce.execute(thisOnce) }, thisOnce.delay);
	} else {
		thisOnce.timerId = setTimeout(function() { thisOnce.execute(thisOnce) }, thisOnce.delay);
	}
	thisOnce.status = 'running';
	return thisOnce;
};
/* -----------------------------------------------------------------
 *	method: Minions.prototype.runOncePer.prototype.stop
 *		stops the timer
 *
 *	parameters: 
 *		
 *	returns: 
 * 	thisOnce - {object} the local scope
 *
 *	------------------------------------------------------------------*/
Minions.prototype.runOncePer.prototype.stop = function() {
	var thisOnce = this;
	if (thisOnce.type === 'timeout') clearTimeout(thisOnce.timerId);
	else if (thisOnce.type === 'interval') clearInterval(thisOnce.timerId);	
	thisOnce.status = 'stopped';
	return thisOnce;
};
/* -----------------------------------------------------------------
 *	method: Minions.prototype.runOncePer.prototype.destroy
 *		attempts to delete this instance of runOncePer 
 *
 *	parameters: 
 *		
 *	returns: 
 * 	delete this - {boolean} the result of the delete command
 *
 *	------------------------------------------------------------------*/
Minions.prototype.runOncePer.prototype.destroy = function() {
	delete this;
	return;
};

/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: minions.alias
 *		sets aliases for commands see also: <minions.run>
 *
 *	parameters:
 *		alias - {array||string} the aliases to assign to the func.
 *		func - {function} the function to assign to the aslias(es)
 *		description - {string} please describe your alias.
 *
 *	returns:
 *		result - {boolean} true if the alias(es) were set successfully.
 * --------------------------------------------------------------------------- */
Minions.prototype.alias = function(alias, func, description) {
	if (typeof this._aliases === 'undefined') this._aliases = {};
	if (typeof func === 'function') {
		if (typeof alias === 'string') var aliases = [ alias ]; 
		else aliases = alias;
		for (var i=0; i<aliases.length; i++) {
			this._aliases[aliases[i]] = func;
		}
		func.description = function() { return description; };
	} else return false;
	return this._aliases;
};


Minions.prototype.runCommand = function(selector) {
	var text = jQuery(selector).val();
	if (text[0] != '.') return false;
	var ctext = text.substr(1);
	var cmd = ctext.split(' ',1).toString();
	var parameters = ctext.substr(cmd.length+1);
	if (typeof this._aliases[cmd] === 'function') {
		this._aliases[cmd].apply(document,[parameters]);
		jQuery(selector).val('');	 
	}
	return true;	
};



Minions.prototype.defaultTo = function(delivered, expected) {
	if (typeof delivered !== typeof expected) return expected;
	return delivered;
};


Minions.prototype.defaultPropertiesTo = function(delivered, expected) {
	if (typeof delivered !== typeof expected) return expected;
	for (var n in expected) {
		if (typeof delivered[n] !== typeof expected[n]) delivered[n] = expected[n];
	}
	return delivered;
};

Minions.prototype.workWithObjectAsync = function(sourceObject, functionToRun, scope, parametersToGive, callbackForTheObject) {
	var myAssignCallback = function() {
		var results = arguments;
		callbackForTheObject(sourceObject, results);
	};
	for (var i=0; i < parametersToGive.length; i++) {
		if (parametersToGive[i] === 'callback') parametersToGive[i] = myAssignCallback;
	}
	functionToRun.apply(scope, parametersToGive);
	return true;
};







/* ----------------------------------------------------------------------------
 * -------------- register minions with the system   -----------------------
 * --------------------------------------------------------------------------- 
 */
;( function() {
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = Minions;
	} else {
		window.minions = new Minions();
	}
} ) ();

;