var JQueryMinions = function() {};

// !! nameChange VisualWebClient.HTMLcontainers -> HTMLcontainers
// !! changed parameters
/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: JQueryMinions.prototype.HTMLcontainers
 *		loads and image and renders it to an invisible area of the screen (showing it, so that width and height can be determined) 
 *
 *	parameters:
 *		url - {string} the url for the image
 *		callback - {function} optional. the function to be called once the image has fully loaded. the callback will get two arguments : a boolean to tell it whether the image was loaded successfully and the dom image object that was genereated and contains the loaded image 
 *
 *	returns:
 *		newImg - {object} the dom img object that (will) contain the image
 * --------------------------------------------------------------------------- */ 
JQueryMinions.prototype.aHTMLContainer = function(options) {
	this.data = '';
	this.status = 'init'; // possible values = 'init', 'filled', 'cleared', 'loaded', 'error'
	this.type = 'aHTMLcontainer';
	this.parentSelector = 'body';
	this.options = (typeof options === 'object') ? options : {};
	this.DOMelement = document.createElement('div');
	if (typeof this.options.id === 'string') {
		this.DOMelement.id = this.options.id;
	} else {
		this.DOMelement.id = this.randomString(16);
	}
	if (typeof this.options.preLoadClasses === 'string') jQuery(this.DOMelement).addClass(this.options.preLoadClasses);
	if (typeof this.options.defaultData === 'string') this.data = this.options.defaultData;
	if (typeof this.options.parentSelector === 'string') this.parentSelector = this.options.parentSelector;
	jQuery(this).attr('status', this.status);
	jQuery(this.DOMelement).html(data);
	jQuery(this.DOMelement).appendTo(this.parentSelector);
	return this;
};
JQueryMinions.prototype.aHTMLContainer.prototype.fill = function(data) {
	this.data = data;
	this.status = 'filled';
	jQuery(this).attr('status', this.status);
	jQuery(this.DOMelement).html(data);
	return this;
};
JQueryMinions.prototype.aHTMLContainer.prototype.clear = function() {
	this.data = '';
	this.status = 'cleared';
	this.fill();
	jQuery(this.DOMelement).html(data);
	return this;
};
JQueryMinions.prototype.aHTMLContainer.prototype.loadHTML = function(html_url, keepLineBreaks, onLoadCallback) {
	var me = this;
	if (keepLineBreaks === 'undefined') keepLineBreaks = true;
	var targeturl = encodeURI(html_url);
	jQuery(me.DOMelement).attr('data-url', targeturl);
	jQuery.ajax({
		type: 'GET',
		url: html_url,
		cache: false,
		success: function(doc){
			if (keepLineBreaks !== true) {
				doc = doc.replace(/(\r\n|\n|\r)/gm,'');
			}
			me.fill(doc);
			me.status = 'loaded';
			jQuery(me).attr('status', me.status);
			if (typeof me.options.postLoadClasses === 'string') {
				jQuery(me.DOMelement).removeClass(me.options.preLoadClasses);
				jQuery(me.DOMelement).addClass(me.options.postLoadClasses);
			}
			if (typeof onLoadCallback === 'function') onLoadCallback(me);
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			me.status = 'error';
			jQuery(me).attr('status', me.status);
			me.fill('<div>error loading content: ' + errorThrown + '</div>');
			if (typeof onLoadCallback === 'function') onLoadCallback(me);
		}
	});
	return true;
};


// !! nameChange PreLoadImage -> preLoadImage
/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: JQueryMinions.prototype.preLoadImage
 *		loads and image and renders it to an invisible area of the screen (showing it, so that width and height can be determined) 
 *
 *	parameters:
 *		url - {string} the url for the image
 *		callback - {function} optional. the function to be called once the image has fully loaded. the callback will get two arguments : a boolean to tell it whether the image was loaded successfully and the dom image object that was genereated and contains the loaded image 
 *
 *	returns:
 *		newImg - {object} the dom img object that (will) contain the image
 * --------------------------------------------------------------------------- */ 
JQueryMinions.prototype.preLoadImage = function(url,callback) {
	if (
		typeof url !== 'string' || 
		url.length < 4 || 
		url.indexOf('png')<2 || 
		url.indexOf('jpg')<2 ||
		url.indexOf('jpeg')<2 ||
		url.indexOf('gif')<2 ||
		url.indexOf('ico')<2 ||
		url.indexOf('svg')<2 ||
		url.indexOf('tiff')<2)
			{
				if (typeof callback === 'function') {
					callback(false);
				} else {
					return false;
				}
			}
	var newImg = document.createElement('img');
	jQuery(newImg).css('display', 'block');
	jQuery(newImg).css('position', 'absolute');
	jQuery(newImg).css('left', '-30000px');
	jQuery(newImg).css('top', '-30000px');
	jQuery(newImg).attr('id', this.randomString(16));
	jQuery(newImg).addClass('vwc_PreLoadedImage');
	var problemHandler = function(e) {
		jQuery(newImg).detach();
		if (typeof callback === 'function') {
			callback(true, newImg);
		}
	};
	jQuery(newImg).bind(
		'load',
		problemHandler
	);
	jQuery(newImg).bind(
		'cacheload',
		problemHandler
	);
	jQuery(newImg).bind(
		'error',
		problemHandler
	);
	jQuery(newImg).appendTo('body')[0];
	jQuery(newImg).attr('src', url);
	return newImg;
};


/* -----------------------------------------------------------------
 *	method: JQueryMinions.prototype.modifyEvent
 *		[JQUERY] modifies a jQuery event and then starts its bubbling again
 *
 *	parameters: 
 *		jQEvent - {object} the event Object passed to a jQuery.on handler function
 *		newProperties - {object||function} anything you want to change or add to the event object namespace. 
 *		
 *	returns: 
 * 		false - {boolean} - necessary to stop eventPropagation
 *
 *	------------------------------------------------------------------*/
// see this problem http://jsfiddle.net/itsatony/PZFAM/#base
JQueryMinions.prototype.modifyEvent = function(jQEvent, newProperties) {
	var nextBubbleStep = jQEvent.currentTarget.parentNode;
	var propertiesToSet = (jQuery.isFunction(newProperties)) ? newProperties(jQEvent) : newProperties
	jQuery.extend(jQEvent, propertiesToSet);
	jQuery(nextBubbleStep).trigger(jQEvent);
	return false;
};


/* -----------------------------------------------------------------
 *	method: JQueryMinions.prototype.getRelativePositionOfEvent
 *		[JQUERY] number crunching of coordinates
 *
 *	parameters: 
 *		jQevent - {object} the event Object passed to a jQuery.on handler function
 *		relativeElement - {sting||object||function} defaults to parentNode.
 *		
 *	returns: 
 * 		jQEvent - {object} - the jQuery event Object extended by relativePosition: { x:1, y:1 }
 *
 *	------------------------------------------------------------------*/
// see this problem http://jsfiddle.net/itsatony/PZFAM/#base
JQueryMinions.prototype.getRelativePositionOfEvent = function(receivingElement, jQEvent, relativeElement, zoomLevel) {
	if (typeof relativeElement === 'undefined' || relativeElement === null) {
		relativeElement = jQEvent.target.parentNode;
	}
	if (typeof zoomLevel !== 'number') zoomLevel = 1;
	var myDOMe = receivingElement;
	var myX = parseInt(jQuery(myDOMe).css('left'));
	if (isNaN(myX)) myX = 0;
	var clientX = parseInt(jQEvent.clientX);
	var clientScrollX = jQuery(window).scrollLeft();
	var relativeX = jQuery(relativeElement).offset().left;
	var relativeScrollX = jQuery(relativeElement).scrollLeft();
	var newX =  clientX/zoomLevel  - relativeX + clientScrollX + relativeScrollX;
	
	var myY = parseInt(jQuery(myDOMe).css('top'));
	if (isNaN(myY)) myY = 0;
	var clientY = parseInt(jQEvent.clientY);
	var clientScrollY = jQuery(window).scrollTop();
	var relativeY = jQuery(relativeElement).offset().top;
	var relativeScrollY = jQuery(relativeElement).scrollTop();
	var newY =  clientY/zoomLevel - relativeY + clientScrollY + relativeScrollY;
	var propertiesToSet = {
		relativePosition: {
			x: newX,
			y: newY
		}
	};
	jQuery.extend(jQEvent, propertiesToSet);	
	return jQEvent;
};


/* -----------------------------------------------------------------
 *	function: JQueryMinions.prototype.isInBox
 *		[JQUERY] detects browser type and version and fills the body class with the info
 *
 *	parameters: 
 *		selector - {object} the object(s) to be checked for being in the box
 *		x1 - {number} the box's topleft coordinate's x
 *		y1 - {number} the box's topleft coordinate's y
 *		x2 - {number} the box's bottomright coordinate's x
 *		y2 - {number} the box's bottomright coordinate's y
 *
 *	returns: 
 * 		elements - {array} all objects from selector that fit into the box
 *
 *	------------------------------------------------------------------*/
JQueryMinions.prototype.isInBox = function(selector, x1, y1, x2, y2, zoomFactor) {
    var elements = [];
		if (typeof zoomFactor !== 'number') zoomFactor = 1;
		jQuery(selector).each(function() {
        var $this = jQuery(this);
				// $this.offset(); <-- unrealiable when scale is used
        var offset = {
					top: $this.css('top'),
					left: $this.css('left')
				};
        var x = Math.round(parseInt(offset.left) * zoomFactor);
        var y = Math.round(parseInt(offset.top) * zoomFactor);
        var w = Math.round(parseInt($this.width()) * zoomFactor);
        var h = Math.round(parseInt($this.height()) * zoomFactor);
        if (
					( x > x1 || x === x1 )
           && ( y > y1 || y === y1 )
           && ( (x + w) < x2 || (x + w) === x2 )
           && ( (y + h) < y2 || (y + h) === y2 )
				) {
					// this element fits inside the selection rectangle
					elements.push($this.get(0));
					// scrap
					console.log('YESS ' + $this.attr('id') + '@' + x + ',' + y + ' - ' + (x+w) + ',' + (y+h));
        } else {
					// console.log('NOOO ' + $this.attr('id') + '@' + x + ',' + y + ' - ' + (x+w) + ',' + (y+h));
				}
    });
    return elements;
};


/* -----------------------------------------------------------------
 *	function: JQueryMinions.prototype.detectBrowser
 *		[JQUERY] detects browser type and version and fills the body class with the info
 *
 *	parameters: 
 *
 *	returns: 
 * 	true - {boolean}
 *
 *	------------------------------------------------------------------*/
JQueryMinions.prototype.detectBrowser = function() {
	var userAgent = navigator.userAgent.toLowerCase();
	jQuery.browser.chrome = /chrome/.test(navigator.userAgent.toLowerCase()); 
  // Is this a version of IE?
  if (jQuery.browser.msie){
		jQuery('body').addClass('browserIE');
		// Add the version number
		jQuery('body').addClass('browserIE' + jQuery.browser.version.substring(0,1));
	}    
	if (userAgent.indexOf('msie 10.0') > -1) jQuery('body').addClass('msie10');    
	// Is this a version of Chrome?
	if (jQuery.browser.chrome) {    
		jQuery('body').addClass('browserChrome');			
		//Add the version number
		userAgent = userAgent.substring(userAgent.indexOf('chrome/') +7);
		userAgent = userAgent.substring(0,1);
		jQuery('body').addClass('browserChrome' + userAgent);			
		// If it is chrome then jQuery thinks it's safari so we have to tell it it isn't
		jQuery.browser.safari = false;
	}
	// Is this a version of Safari?
	if (jQuery.browser.safari){
			jQuery('body').addClass('browserSafari');
			// Add the version number
			userAgent = userAgent.substring(userAgent.indexOf('version/') +8);
			userAgent = userAgent.substring(0,1);
			jQuery('body').addClass('browserSafari' + userAgent);
	}
	// Is this a version of Mozilla?
	if (jQuery.browser.mozilla){
		//Is it Firefox?
		if (navigator.userAgent.toLowerCase().indexOf('firefox') != -1){
			jQuery('body').addClass('browserFirefox');

			// Add the version number
			userAgent = userAgent.substring(userAgent.indexOf('firefox/') +8);
			userAgent = userAgent.substring(0,1);
			jQuery('body').addClass('browserFirefox' + userAgent);
		}
		// If not then it must be another Mozilla
		else {
			jQuery('body').addClass('browserMozilla');
		}
	}
	// Is this a version of Opera?
	if (jQuery.browser.opera){
		jQuery('body').addClass('browserOpera');
	}	
	return true;
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: JQueryMinions.prototype.randomlyPositionObjectGroup
 *		this takes a set of DOM objects and randomly positions them within a 2d space
 *		!ATTENTION! the objects need to be displayed in order for this to work properly, as object dimensions are not reliable (often null) for display:none dom objects!
 *		!ATTENTION 2! if your target box is too small (or the objects too large or too many) the function will abort trying to fit them all in (after 1000 attempts) in order to prevent window-blocking!
 *
 *	parameters:
 *		DOMGroupSelector - {string} jQuery-style DOM element selector 
 *		allowOverlap - {boolean} defaults to false. are the objects allowed to overlap?
 *		limits - {object} .min.x .min.y .max.x, .max.y {integer}s that make up the box that the objects need to fit in.
 *
 *	returns:
 *		ObjectGroup - {object} contains all the newly positioned objects and their new positions.
 * --------------------------------------------------------------------------- */
JQueryMinions.prototype.randomlyPositionObjectGroup = function(DOMGroupSelector, allowOverlap, Limits) {
	var ObjectGroup = {};
	var nonOverlap = true;
	var ObjectKey = -1;
	jQuery(DOMGroupSelector).each(function() {
		ObjectKey++;
		var accept = false;
		var attemptCounter = 0;
		while (accept === false) {
			attemptCounter++;
			var myTemp = {
				myLeft: Limits.x.min + Math.floor(Math.random()*(Limits.x.max-Limits.x.min)),
				myTop: Limits.y.min + Math.floor(Math.random()*(Limits.y.max-Limits.y.min)),
				myWidth:  jQuery(this).width(),
				myHeight: jQuery(this).height()
			};
			myTemp.myBottom = myTemp.myTop + myTemp.myHeight;
			myTemp.myRight = myTemp.myLeft + myTemp.myWidth;
			myTemp.id = jQuery(this).attr('id');
			if (allowOverlap) {
				accept = true;
			} else {
				var overlap = -1;
				for (var key in ObjectGroup) {
					if (ObjectGroup[key].doesOverlap(myTemp)) {
						overlap = key;
						break;
					}
				}
				if (overlap == -1) accept = true;
				if (attemptCounter > 1000) {
					nonOverlap = false;
					// console.log('randomizing nonOverlapping positions did not work -- seems like there is not enough space! :(');
					accept = true;
				}
			}
		}
		ObjectGroup[ObjectKey] = myTemp;
		ObjectGroup[ObjectKey].doesOverlap = function(newObjectDimensions) {
			var xOverlap = false;
			var yOverlap = false;
			if ( (newObjectDimensions.myLeft >= this.myLeft && newObjectDimensions.myLeft <= this.myRight) || (newObjectDimensions.myRight >= this.myLeft && newObjectDimensions.myRight <= this.myRight) || (newObjectDimensions.myLeft < this.myLeft && newObjectDimensions.myRight > this.myRight) ) {
				xOverlap = true;
			}
			if ( (newObjectDimensions.myTop >= this.myTop && newObjectDimensions.myTop <= this.myBottom) || (newObjectDimensions.myBottom >= this.myTop && newObjectDimensions.myBottom <= this.myBottom) || (newObjectDimensions.myTop < this.myTop && newObjectDimensions.myBottom > this.myBottom)  ) {
				yOverlap = true;
			}
			return (xOverlap && yOverlap);
		}
		jQuery(this).css('left', ObjectGroup[ObjectKey].myLeft);
		jQuery(this).css('top', ObjectGroup[ObjectKey].myTop);		
	});
	return ObjectGroup;
};


/* --------------------------------------------------------------------------
 * --------------------------------------------------------------------------
 *	function: JQueryMinions.prototype.addAudio
 *		adds audio resources to the dom. preloades them, too!
 *
 *	parameters:
 *		Id - {string}
 *		parentDomSelector - {string||object} jQuery-style DOM object selector
 *		sources - {array} the urls to the mp3, ogg, wav files - make sure to include at least mp3 and .ogg for browser compatibility reasons!
 *		options - {object} the options to add to the html audio element (defaults to {preload:'auto'}). the default will be extended!
 *
 *	returns:
 *		audio - {object} the dom object that was attached.
 * --------------------------------------------------------------------------- */
JQueryMinions.prototype.addAudio = function(Id, parentDomSelector, sources, options) {
	if (typeof parentDomSelector === 'undefined') parentDomSelector = 'body';
	var _default__sources = {
		/*
		0: 'audioFile.ogg',
		1: 'audioFile.mp3'
		*/
	};
	jQuery.extend(true, _default__sources, sources);
	var _default__options = {
		//autoPlay: 'autoplay',
		//controls: 'no',
		//loop: 'loop',
		preload: 'auto'
	};
	jQuery.extend(true, _default__options, options);
	var _default__Id = 'audio__' + this.randomString(16);
	if (typeof Id === 'undefined') Id = _default__Id;
	if (jQuery('#'+Id).length > 0) {
		jQuery('#'+Id).remove();
	}
	var audio = document.createElement('audio');
	jQuery(audio).attr('id',Id);
	jQuery(audio).attr('autoPlay', options.autoPlay);
	jQuery(audio).attr('controls', options.controls);
	jQuery(audio).appendTo(parentDomSelector);
	for (key in sources) {
		jQuery('<source>').attr('src', sources[key]).appendTo(audio);
	}
	return audio;
};

// --> renamed assignZoomClasses -> setCssScale
JQueryMinions.prototype.setCssScale = function(jQSelector, newZoomFactor) {
//jQuery(jQSelector).css('zoom', this.currentZoom);
	jQuery(jQSelector).css('-moz-transform-origin', '0 0');
	jQuery(jQSelector).css('-o-transform-origin', '0 0');
	jQuery(jQSelector).css('-webkit-transform-origin', '0 0');
	jQuery(jQSelector).css('-moz-transform', 'scale(' + newZoomFactor + ')');
	jQuery(jQSelector).css('-webkit-transform', 'scale(' + newZoomFactor + ')');
	jQuery(jQSelector).css('-o-transform', 'scale(' + newZoomFactor + ')');
	jQuery(jQSelector).css('-ms-transform', 'scale(' + newZoomFactor + ')');
	jQuery(jQSelector).css('transform', 'scale(' + newZoomFactor + ')');
	// webkit/chrome fix for scaling artifacts
	jQuery(jQSelector).css('-webkit-backface-visibility', 'hidden');
	jQuery(jQSelector).attr('data-zoomable-scale', newZoomFactor);	
	return newZoomFactor;
};


/* -----------------------------------------------------------------
 *	class: JQueryMinions.prototype.zoomable 
 *		this class allows elements to be zoomable in all browsers and still work during drag with jQueryUI
 *
 *	parameters: 
 *		objectSelector - {string} the jQuery selector that matches all elements you want to zoom
 *		containerSelector - {string} the jQuery selector that defines the container for your draggable elements
 *		draggableSelector - {string} the jQuery selector that matches your draggable elements
 *
 *	returns: 
 * 	this - {object}
 *
 *	------------------------------------------------------------------*/
JQueryMinions.prototype.zoomable = function(objectSelector, containerSelector, draggableSelector, options) {
	this.objectSelector = objectSelector;
	this.containerSelector = containerSelector;
	if (typeof options !== 'object') options = {};
	this.currentZoom = (typeof options.value === 'number') ? options.value : 1;
  this.minZoom = (typeof options.min === 'number') ? options.min : 0;
  this.maxZoom = (typeof options.max === 'number') ? options.max : 2;
	this.onZoomChange = (typeof options.onZoomChange === 'function') ? options.onZoomChange : function(newZoomLevel) {} ;
	if (typeof draggableSelector !== 'undefined' && draggableSelector !== null) {
		this.dragSelector = draggableSelector;
		this.setDraggable();
	}  
	return this;
};
/* -----------------------------------------------------------------
 *	method: JQueryMinions.prototype.zoomable.prototype.zoomDelta
 *		call this to change the zoom level relatively (+1, -1, ...)
 *
 *	parameters: 
 *		level - {number} the delta to add to the current zoom level
 *
 *	returns: 
 * 	this - {object}
 *
 *	------------------------------------------------------------------*/
JQueryMinions.prototype.zoomable.prototype.zoomDelta = function(level) {
	var newZoomLevel = this.currentZoom + level;
  if (newZoomLevel < this.minZoom) {
    newZoomLevel = this.minZoom;
  } else if (newZoomLevel > this.maxZoom) {
    newZoomLevel = this.maxZoom;
  }
	this.setZoom(newZoomLevel);
	return this;
};
/* -----------------------------------------------------------------
 *	method: JQueryMinions.prototype.zoomable.prototype.setZoom
 *		call this to change the zoom level absolutely (2, 0.2, ...)
 *
 *	parameters: 
 *		level - {number} the new Zoom level. defaults to this.currentZoom
 *
 *	returns: 
 * 	this - {object}
 *
 *	------------------------------------------------------------------*/
JQueryMinions.prototype.zoomable.prototype.setZoom = function(level) {
	var newLevel = (typeof level === 'number') ? level : this.currentZoom;
	this.currentZoom = Math.round(newLevel * 100) / 100;	
	this.setCssScale(this.objectSelector, this.currentZoom);	
	if (typeof this.onZoomChange === 'function') this.onZoomChange(this.currentZoom);
	return this;
};
/* -----------------------------------------------------------------
 *	method: JQueryMinions.prototype.zoomable.prototype.setDraggable
 *		call this to control drag behavior for this.dragSelector matching elements. 
 *
 *	parameters: 
 *
 *	returns: 
 * 	this - {object}
 *
 *	------------------------------------------------------------------*/
JQueryMinions.prototype.zoomable.prototype.setDraggable = function() {
	var containerSelector = this.containerSelector;
	var dragSelector = this.dragSelector;
	var zoomable = this; 
	jQuery(dragSelector).draggable({		
		start : function(evt, ui) {
			var zoom = zoomable.currentZoom;
			var pageY = evt.originalEvent.pageY / zoom;
			var pageX = evt.originalEvent.pageX / zoom;
			var containerTop = jQuery(containerSelector).position().top;
			var containerLeft = jQuery(containerSelector).position().left;
			var targetTop = parseInt(jQuery(this).position().top) ;
			var targetLeft = parseInt(jQuery(this).position().left)  ;
			this.dragStartY = Math.round((pageY - containerTop - targetTop) ) ;
			this.dragStartX = Math.round((pageX - containerLeft - targetLeft) ) ;
			// console.log('pageX %s - containerLeft %s - targetLeft %s => dragStartX: %s', pageX, containerLeft, targetLeft, this.dragStartX);
		},		
		drag : function(evt, ui) {
			var zoom = zoomable.currentZoom;				
			var containerTop = jQuery(containerSelector).position().top;
			var containerLeft = jQuery(containerSelector).position().left;
			var containerHeight = jQuery(containerSelector).height();
			var containerWidth = jQuery(containerSelector).width();	
			// zoom fix
			ui.position.top = Math.round(evt.originalEvent.pageY  / zoom) - containerTop - this.dragStartY;
			ui.position.left = Math.round(evt.originalEvent.pageX  / zoom) - containerLeft - this.dragStartX; 
			// don't let draggable to get outside of the container
			if (ui.position.left < 0) 
				ui.position.left = 0;
			if (ui.position.left + jQuery(this).width() > containerWidth)
				ui.position.left = containerWidth - jQuery(this).width();  
			if (ui.position.top < 0)
				ui.position.top = 0;
			if (ui.position.top + jQuery(this).height() > containerHeight)
				ui.position.top = containerHeight - jQuery(this).height();
		}
	});	
	return this;
};
JQueryMinions.prototype.zoomable.prototype.setCssScale = function(jQSelector, newZoomFactor) {
//jQuery(jQSelector).css('zoom', this.currentZoom);
	jQuery(jQSelector).css('-moz-transform-origin', '0 0');
	jQuery(jQSelector).css('-o-transform-origin', '0 0');
	jQuery(jQSelector).css('-webkit-transform-origin', '0 0');
	jQuery(jQSelector).css('-moz-transform', 'scale(' + newZoomFactor + ')');
	jQuery(jQSelector).css('-webkit-transform', 'scale(' + newZoomFactor + ')');
	jQuery(jQSelector).css('-o-transform', 'scale(' + newZoomFactor + ')');
	jQuery(jQSelector).css('-ms-transform', 'scale(' + newZoomFactor + ')');
	jQuery(jQSelector).css('transform', 'scale(' + newZoomFactor + ')');
	jQuery(jQSelector).attr('data-zoomable-scale', newZoomFactor);	
	return newZoomFactor;
};



/* -----------------------------------------------------------------
 *	function: JQueryMinions.prototype.noScroll
 *		this fancy thing picks up scroll events and 'undoes' them by resetting scroll to 0. 
 *
 *	parameters: 
 *		noScrollDomObject - {object} the object you want not to scroll. defaults to the body of your document of course
 *		
 *	returns: 
 * 	thisOnce - {object} the local scope
 *
 *	------------------------------------------------------------------*/
JQueryMinions.prototype.noScroll = function(noScrollDomObject) {
	jQuery(window).on(
		'scroll',
		function(e) {
			if (typeof noScrollDomObject !== 'object') noScrollDomObject = jQuery('body')[0];
			noScrollDomObject.scrollTop = 0;
			noScrollDomObject.scrollLeft = 0;			
			return false;
		}
	);
	return true;
};


/* -----------------------------------------------------------------
 *	function: JQueryMinions.prototype.drawHelperLine
 *		simply draws a line by creating a border-colored DIV element 
 *
 *	parameters: 
 *		x - {number} the x coordinate. defaults to 0
 *		y - {number} the y coordinate. defaults to 0
 *		z - {number} the z coordinate. defaults to 1000000000
 *		color - {string} the border Color. defaults to '#99ff00'
 *		parent - {string||object} the parent element selector for jQuery. defaults to 'body'
 *		width - {number} width of the border
 *		dieAfter - {number} milliseconds before line is auto-removed from dom
 *		id - {string} the id you want to assign to the dom element
 *		
 *	returns: 
 * 		thisOnce - {object} the local scope
 *
 *	------------------------------------------------------------------*/
JQueryMinions.prototype.drawHelperLine = function(x, y, z, color, parent, width, dieAfter, id) {
  var helperLine = document.createElement('div'); 
	if (typeof id === 'string') jQuery(helperLine).attr('id', id);
  jQuery(helperLine).addClass('minionsHelperLine');
  jQuery(helperLine).css('z-index', (typeof z === 'number') ? z : '1000000000'); 
  jQuery(helperLine).css('top', (typeof y === 'number') ? y : 0); 
  jQuery(helperLine).css('height', (typeof y === 'number') ? '0px' : '100%');
  jQuery(helperLine).css('left', (typeof x === 'number') ? x : 0); 
  jQuery(helperLine).css('width', (typeof x === 'number') ? '0px' : '100%');
  var borderColor = (typeof color === 'string') ? color : '#99ff00';
	if (typeof width !== 'number') width = 1;
  jQuery(helperLine).css('border-top', width + 'px solid ' + borderColor); 
  jQuery(helperLine).css('border-left', width + 'px solid ' + borderColor); 
  jQuery(helperLine).css('position', 'absolute'); 
  var parentSelector = (typeof parent === 'undefined') ? 'body' : parent;
  jQuery(parentSelector).append(helperLine);
  jQuery(helperLine).on('click', function(e) { jQuery(helperLine).remove(); });
  //jQuery(helperLine).hover(function(e) { jQuery(helperLine).css('border-top', '3px solid ' + borderColor); jQuery(helperLine).css('border-left', '3px solid ' + borderColor); }, function(e) { jQuery(helperLine).css('border-top', '1px solid ' + borderColor); });
	if (typeof dieAfter === 'number') {
		setTimeout(
			function() {
				jQuery(helperLine).remove();
			}
			,dieAfter
		);
	}
  return helperLine;
};


( function() { 
	jQuery.fn.zoom = function(zoomLevel) {
		if (typeof zoomLevel !== 'number') zoomLevel = 1;
		return this.each(function(){
			var $jqThis = jQuery(this);
			$jqThis.css('transform-origin', '0 0');
			$jqThis.css('-moz-transform-origin', '0 0');
			$jqThis.css('-webkit-transform-origin', '0 0');
			$jqThis.css('-o-transform-origin', '0 0');
			$jqThis.css('-moz-transform', 'scale(' + zoomLevel + ')');
			$jqThis.css('-webkit-transform', 'scale(' + zoomLevel + ')');
			$jqThis.css('-o-transform', 'scale(' + zoomLevel + ')');
			$jqThis.css('-ms-transform', 'scale(' + zoomLevel + ')');
			$jqThis.css('transform', 'scale(' + zoomLevel + ')');
			$jqThis.attr('data-zoomable-scale', zoomLevel);	
		});
	};
}		)(jQuery);
/* ----------------------------------------------------------------------------
 * -------------- register minions with the system   -----------------------
 * --------------------------------------------------------------------------- 
*/
;( function() {
	var root = this;
	if (typeof root['Minions'] === 'undefined') {
		console.log('[JQueryMinions] this function set depends on the basic minions library! please load that first!');
		return;
	}
	// extending the prototype set of Minions
	for (var i in JQueryMinions.prototype) {
		window.minions[i] = JQueryMinions.prototype[i];
	}
} ) ();

;