define([
	'knockout',
], function(ko){

	"use strict";

	return function MessageModel(data) {
		this.id = ko.observable("");
		this.time = ko.observable("");
		this.message = ko.observable("");
		this.author = ko.observable("");
		this.isConfirmedByServer = ko.observable(true);

		this.load = function (data) {
			ko.mapping.fromJS(data, {}, this);
		};
		this.load(data);
	}
});