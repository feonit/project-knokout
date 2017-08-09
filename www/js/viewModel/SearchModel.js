define([
	'application',
	'knockout',
	'WebinarModel',
	'FileViewModel',
	'UserModel',
	'ajaxAdapter'
], function(
	application,
	ko,
	WebinarModel,
	FileViewModel,
	UserModel,
	ajaxAdapter
){

	"use strict";

	var SearchModel = function(){
		var that = this;

		this.opened = ko.observable(false);
		this.loaded = ko.observable(false);
		this.loading = ko.observable(false);
		this.items = ko.observableArray();
		this.onEnter = ko.observable(false);

		this.counters = {
			all : ko.observable(0),
			user : ko.observable(0),
			file : ko.observable(0),
			event : ko.observable(0)
		};

		this.searchString = ko.observable("").extend({
			validate: {
				deferredMode: true, // Если TRUE, то отображать ошибки только в случаи вызова чек функции
				rules: [
					{
						type: "required",
						message: "Поле не заполнено"
					}
				]
			}
		});

		this.searchString.subscribe(function(value) {
			if (value == '') {
				that.reset();
			}
		});

		this.reset = function () {
			this.items.removeAll();
			this.searchString('');
			this.onEnter(false);
			this.searchString.hasError(false);
		};

		this.filterResult = function (type) {
			var items = this.items();
			var filterItems = [];
			for (var index in items) {
				var value = items[index];
				if (value['type'] == type) {
					filterItems.push(items[index]);
				}
			}
			return filterItems;
		};

		this.openPreview = function (obj) {
			application.mediator.trigger('PREVIEW_FRAME', 'show:file', obj.model);
		};

		this.searchRequst = function () {
			var that = this;

			this.loading(true);
			if (this.searchString.check()) {

				ajaxAdapter.request('/search/main/', 'POST', {'q': this.searchString()}, function (response, textStatus) {

					if (!response || !response.result || !response.result.data || response.status !== "success"){
						throw Error('global search has no valid answer from server');
					}
					var items = [],
						data = response.result.data;

					that.items.removeAll();
					that.onEnter(true);

					var counters = {all: 0, user: 0, file: 0, event: 0};

					for (var index in data) {
						var value = data[index];

						counters.all += 1;

						var model;

						switch (value.type) {
							case "1":
								model = new UserModel(value.data);
								counters.user += 1;
								break;
							case "2":
								model = new FileViewModel(value.data);
								counters.file += 1;
								break;
							case "3":
								model = new WebinarModel(value.data);
								counters.event += 1;
								break;
						}

						items.push({'type':value.type, 'model':model});
					}

					that.items(items);

					ko.mapping.fromJS({ counters: counters}, {}, that);

					that.loading(false);
					that.loaded(true);
				});
			}
		};

		this.openSearch = function () { // bind click have other context
			var globSearch = $(".global_search"),
				midMain = $(".middle_main_content"),
				globView = $(".global_searchview"),
				selSearch;

			midMain.toggleClass("main_hide");

			var opened = !application.root().search().opened(); //toggle state

			if (opened) {
				globSearch.slideDown(200, 'swing', function() {
					globView.animate({opacity: "show"}, 200);
					selSearch = $('.search_sel');
					selSearch.select();
					application.root().search().opened(opened);
				});
			} else {
				globView.animate({opacity: "hide"}, 200, function() {
					globSearch.slideUp(200);
					that.reset();
					application.root().search().opened(opened);
				});
			}
		};

		this.closeForce = function(){
			if (application.root().search().opened() === false) return;

			application.root().search().opened(false);

			var glob_search = $(".global_search");
			var glob_view = $(".global_searchview");
			var mid_main = $(".middle_main_content");

			mid_main.removeClass("main_hide");

			glob_view.animate({opacity: "hide"}, 200, function() {
				glob_search.slideUp(200);
				application.root().search().reset();
			});
		}
	};

	return SearchModel;
});