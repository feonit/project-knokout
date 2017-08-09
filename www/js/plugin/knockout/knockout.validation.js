define([
	'jquery',
	'knockout',
	'show_tooltip'
], function($, ko){
	ko.extenders.validate = function(target, options) {
		target.domElement = ko.observable();
		target.fieldName = ko.observable();
		target.hasError = ko.observable(false);
		target.validationMessage = ko.observable("");

		target.reset = function() {
			target.validationMessage('');
			target('');
		}

		target.check = function(newValue) {
			if (typeof(newValue) == 'undefined') {
				newValue = target();
			}
			target.validationMessage('');
			for (var i in options.rules) {
				switch (options.rules[i].type) {
					case 'required':
						if ((newValue != null && newValue.length == 0) || newValue == null) {
							target.validationMessage(options.rules[i].message);
							return false;
						}
						break;
					case 'length':
						console.log(newValue.length, options.rules[i].length);
						if (newValue.length >= options.rules[i].length) {
							target.validationMessage(options.rules[i].message);
							return false;
						}
						break;
				}
			}
			return true;
		}

		if (target.domElement() !== 'undefined') {
			target.check(target());
		}

		target.hasError.subscribe(function(value) {
			if (value == false) {
				$(target.domElement()).showError('');
			}
		});

		target.validationMessage.subscribe(function (value) {
			target.hasError(!value?false:true);
			if (value !== '') {
				$(target.domElement()).showError(value);
			}
		});


		target.subscribe(function (value) {
			if (options.deferredMode == false || typeof options.deferredMode == 'undefined' || target.hasError() == true) {
				target.check(value);
			}
		});

		//return the original observable
		return target;
	}

	ko.bindingHandlers.validate = {
		init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
			valueAccessor().fieldName(valueAccessor());
			valueAccessor().domElement(element);
		}
	};
});