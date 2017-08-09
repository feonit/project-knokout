define(['application', 'knockout'], function(application, ko){
	var Country = function(name, alpha2, languagesName) {
		this.countryName = name;
		this.alpha2 = alpha2;
		this.languagesName = languagesName;
	};

	var LanguagesModel = function(){
		this.availableCountries = ko.observableArray([
			new Country("RUS", "ru", "Русский"),
			new Country("ENG", "en", "English")
		]);
		this.selectedCountry = ko.observable(application.USER_DATA.userLanguage); // Nothing selected by default

		// this.load
	};

	return LanguagesModel;
});