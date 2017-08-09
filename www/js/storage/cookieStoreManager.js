define([
	'jquery',
	'jquery.cookie'
], function($){

	$.cookie.defaults = {
		expires: 365,
		path: '/'
	};

	return {

		getLanguage : function(){
			return $.cookie().language;
		},

		setLanguage : function(language){
			$.cookie('language', language);
			return language;
		},

		getTheme: function(){
			return $.cookie().theme;
		},

		setTheme: function(theme){
			return $.cookie('theme', theme);
		}
	}
});