define(['knockout'], function(ko){
	var ENTER_KEY = 13;
	var ESCAPE_KEY = 27;

	ko.bindingHandlers.escKey = {
		init: function(element, valueAccessor, allBindings, vm) {
			ko.utils.registerEventHandler(element, "keyup", function(event) {
				if (event.keyCode === 27) {
					valueAccessor().call(vm, vm, event); //set "this" to the data and also pass it as first arg, in case function has "this" bound
				}
				return true;
			});
		},
	};

	ko.bindingHandlers.enterKey = {
		init: function(element, valueAccessor, allBindings, vm) {
			ko.utils.registerEventHandler(element, "keyup", function(event) {
				if (event.keyCode === 13) {
					ko.utils.triggerEvent(element, "change");
					valueAccessor().call(vm, vm, event); //set "this" to the data and also pass it as first arg, in case function has "this" bound
				}
				return true;
			});
		},
	};

	ko.bindingHandlers.hasFocusCall = {
		init: function(element, valueAccessor, allBindings, vm) {
			var callFunction = function()  {
				ko.utils.triggerEvent(element, "change");
				valueAccessor().call(vm, vm);
			};
			// $(element).focus(callFunction);
			$(element).blur(callFunction);
		},
		update: function(element, valueAccessor) {
			var value = valueAccessor();
			if (!ko.unwrap(value)) {
				element.blur();
			}
		}

	};
});