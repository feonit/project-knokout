define(['knockout'], function(ko){
	ko.observableArray.fn.pushAll = function(valuesToPush) {
		var underlyingArray = this();
		this.valueWillMutate();
		ko.utils.arrayPushAll(underlyingArray, valuesToPush);
		this.valueHasMutated();
		return this;  //optional
	};
	ko.observableArray.fn.unshiftAll = function(valuesToPush) {
		var underlyingArray = this();
		this.valueWillMutate();

		while (valuesToPush.length){
			underlyingArray.unshift(valuesToPush.splice(valuesToPush.length - 1, 1)[0])
		}

		this.valueHasMutated();
		return this;  //optional
	};

	//http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser

	var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
	// Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
	var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
	var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
	// At least Safari 3+: "[object HTMLElementConstructor]"
	var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
	var isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6

	ko.utils.isFirefox = isFirefox;
	ko.utils.isSafari = isSafari;
	ko.utils.isChrome = isChrome;
	ko.utils.isOpera = isOpera;
	ko.utils.isIE = isIE;
});