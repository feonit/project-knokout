define(['jquery', 'knockout'], function($, ko){
	ko.bindingHandlers.animateText = {
		update: function(element, valueAccessor) {
			var value = valueAccessor();
			var $element = $(element);
			var currentValue = parseInt($element.text(), 10);

			if (!$.isNumeric(currentValue)){
				console.warn('value must be an number');
				currentValue = 0; // default
			}

			if (currentValue === value || typeof value === 'undefined') { return; }

			$element
				.animate({top: "15px"}, 300, function() {
					$element.css("top", "-15px");
					ko.utils.setHtml($element, value);
				})
				.animate({top: "0"}, 300, function(){

				});
		}
	};

	ko.bindingHandlers.clickAndBehaviorProcessAjax = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			console.log(arguments);
			//
			var handler = arguments[1]();

			var $deferred, saveHtml, $element = $(element);

			function showProcessViewOfElem(){
				saveHtml = $element.html();
				$element.html('<div class="btn_preloader"></div>');
				$element.addClass('disabled_btn send_request');
			}

			function hideProcessViewOfElem(){
				$element.empty();
				$element.html(saveHtml);
				$element.removeClass('disable_btn send_request');
			}

			if ($element.length){
				$element.one('click', function(event){
					showProcessViewOfElem.call(element, arguments);

					// {jqXHR}
					$deferred = handler.apply(viewModel, [viewModel, event]);

					if ($deferred){
						$deferred.done(function(){
							hideProcessViewOfElem.call(element, arguments);
						});
					}

				});

				ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
					$(element).off();
				});
			}

		},
		update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			console.log(arguments)
		}
	};


	ko.bindingHandlers.selectControlBinding = {
		init: function(element){
			$(element).styler();

			setTimeout(function(){
				$(element).trigger('refresh');
			}, 0);

			arguments[1]().subscribe(function(value){
				setTimeout(function(){
					$(element).trigger('refresh');
				}, 0);
			});
		},

		update: function(element){

		}
	}
});