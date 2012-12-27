var BrowserMinions = function() {};

/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: BrowserMinions.prototype.loadJS
 *		[BROWSER] allows dynamic loading of JS code at runtime.
 *
 *	parameters:
 *		url - {string} the url to the javascript code file. 
 *
 *	returns:
 *		script.id - {string||boolean} the id of the inserted script dom element. returns false if bad url was given. 
 * --------------------------------------------------------------------------- */
BrowserMinions.prototype.loadJS = function(url) {
	if (typeof script !== 'string' || script.length < 4) return false;
	if (this.isValidURL(url) === false) return false;
	var script = document.createElement('script');
	script.id = this.makeId(16); 
	script.type = 'text/javascript'; 
	script.src = url;
	document.body.appendChild(script);
	return script.id;
};

/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: BrowserMinions.prototype.isValidURL
 *		[BROWSER] external code snipped that uses a complex regular expression to check whether a string really is a URL
 *		<http://www.weberdev.com/get_example-4569.html>
 *
 *	parameters:
 *		url - {string} the string to be tested 
 *
 *	returns:
 *		result - {boolean} is the given string a url?
 * --------------------------------------------------------------------------- */
BrowserMinions.prototype.isValidURL = function(url) { // thanks to http://www.weberdev.com/get_example-4569.html
	var RegExp = /^(([\w]+:)?\/\/)?(([\d\w]|%[a-fA-f\d]{2,2})+(:([\d\w]|%[a-fA-f\d]{2,2})+)?@)?([\d\w][-\d\w]{0,253}[\d\w]\.)+[\w]{2,4}(:[\d]+)?(\/([-+_~.\d\w]|%[a-fA-f\d]{2,2})*)*(\?(&?([-+_~.\d\w]|%[a-fA-f\d]{2,2})=?)*)?(#([-+_~.\d\w]|%[a-fA-f\d]{2,2})*)?$/; 
	return RegExp.test(url);
};

/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: BrowserMinions.prototype.setCaretPosition
 *		[BROWSER] moves the cursor to a specific position in an Input / Textarea control
 *
 *	parameters:
 *		ctrl - {object} the Input / Textarea control 
 *		pos - {integer} the position
 *
 *	returns:
 *		result - {boolean} true
 * --------------------------------------------------------------------------- */
BrowserMinions.prototype.setCaretPosition = function(ctrl, pos) {
	if (ctrl.setSelectionRange) {
		ctrl.focus();
		ctrl.setSelectionRange(pos,pos);
	} else if (ctrl.createTextRange) {
		var range = ctrl.createTextRange();
		range.collapse(true);
		range.moveEnd('character', pos);
		range.moveStart('character', pos);
		range.select();
	}
	return true;
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: BrowserMinions.prototype.isMobile
 *		[BROWSER] checks whether the navigator claims to be a mobile device
 *
 *	parameters:
 *
 *	returns:
 *		result - {boolean} mobile or not
 * --------------------------------------------------------------------------- */
BrowserMinions.prototype.isMobile = function() {
	return (/mobile/i.test(navigator.userAgent));
};


// !! nameChange GetCLientWidth -> getClientWidth
/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: BrowserMinions.prototype.getClientWidth
 *		determines the absolute total width of the client window
 *
 *	returns:
 *		clientWidth - {integer} the width of the window in pixels
 * --------------------------------------------------------------------------- */
BrowserMinions.prototype.getClientWidth = function() {
	var myWidth = 0;
	if (typeof window.innerWidth === 'number' ) {
		//Non-IE
		myWidth = window.innerWidth;
	} else if (document.executecumentElement && document.executecumentElement.clientWidth) {
		//IE 6+ in 'standards compliant mode'
		myWidth = document.executecumentElement.clientWidth;
	} else if(document.body && document.body.clientWidth) {
		//IE 4 compatible
		myWidth = document.body.clientWidth;
	}
	return (myWidth);
};





/* ----------------------------------------------------------------------------
 * -------------- register minions with the system   -----------------------
 * --------------------------------------------------------------------------- 
 */
;( function() {
	var root = this;
	if (typeof root['Minions'] === 'undefined') {
		console.log('[BrowserMinions] this function set depends on the basic minions library! please load that first!');
		return;
	}
	// extending the prototype set of Minions
	for (var i in BrowserMinions.prototype) {
		Minions.prototype[i] = BrowserMinions.prototype[i];
	}
} ) ();

;