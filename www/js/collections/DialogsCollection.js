define([
	'knockout',
	'ajaxAdapter',
	'DialogModel'
], function(
	ko,
	ajaxAdapter,
	DialogModel
){

	"use strict";

	var DialogsCollection = function(){
		var that = this;

		this.dialogs = ko.observableArray();
		this.onEnter = ko.observable(false);
		this.loading = ko.observable(false);

		/**
		 * @public
		 * */
		this.unreadCount = ko.computed(function(){
			var count = 0;

			count = this.dialogs().filter(function(item){
				return item.read() === false;
			}).length;

			return count;
		}, this);

		this.load = function () {
			this.loading(true);
			ajaxAdapter.getRequestRestApi('/chat', function (data) {
				var key, arr = [];

				for (key in data.result){
					arr.push(new DialogModel(data.result[key]));
				}
				that.dialogs(arr);
				that.loading(false);
			});
		};
	};

	return DialogsCollection;
});