define([
	'knockout',
	'application',
	'calendar',
	'UserModel',
	'text!components/pages/calendar-page/calendar-page.html',
	'mousewheel'
], function (
	ko,
	application,
	calendar,
	UserModel,
	template
) {

	"use strict";

	function Component(params) {
		this.afterRender();
	}

	Component.prototype = {
		constructor: Component,

		afterRender: function(){

			// todo remove this hack for template
			window.UserModel = UserModel;

			calendar.init(function(){});
			$('select').styler();//1
			calendar.onload();//2
		},

		dispose: function(){
			if ( window.API_calendarWebinarComponent ){
				API_calendarWebinarComponent.destroy();
			}

			calendar.destroy();
		}
	};

	return { viewModel: Component, template: template }
});