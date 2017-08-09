define(['knockout', 'UserModel'], function(ko, UserModel){

	return function NewsModel() {
		var that = this;

		this.type = ko.observable();
		this.author = ko.observable();
		this.date = ko.observable();
		this.text = ko.observable();
		this.item_id = ko.observable();

		this.isConfirm = ko.observable("");
		this.viewLink = ko.observable("");
		this.success = ko.observable();
		this.cancel = ko.observable();
		this.userModel = ko.observable(new UserModel());

		this.preview = function () {
			window.location = that.viewLink();
		};
	};
});