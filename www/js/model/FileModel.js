define([
	'_',
	'Model',
	'application',
	'knockout',
	'ajaxAdapter'
], function(
	_,
	Model,
	application,
	ko,
	ajaxAdapter
){

	"use strict";

	/**
	 * @constructor FileModel
	 * */
	return _.defineSubclass(Model, function FileModel( data ) {

		this.availableInLibrary = ko.observable(true);
		this.deleted = ko.observable(false);
		this.hasError = ko.observable(false);
		this.id = ko.observable();
		this.originalFile = ko.observable();
		this.ownerId = ko.observable();
		this.ownerName = ko.observable();
		this.previews = ko.observable();
		this.progress = ko.observable();
		this.secureLevel = ko.observable();
		this.title = ko.observable();
		this.type = ko.observable();

		Model.apply(this, arguments); // after defined attributes

	} , {

		url : function(){
			return '/user/' + this.ownerId()+ '/file/' + this.id();
		},

		/**
		 * @deprecated
		 * */
		// read
		reload : function (id){
			var that = this;
			ajaxAdapter.getRequestRestApi("/user/" + this.ownerId() + "/file/"+this.id(), function (data, textStatus) { // вешаем свой обработчик на функцию success
				if (data.status == 'success') {
					that.setAttributes(data.result);
				}
			});
		},

		// read
		fetch : function(options){
			var callback, ownerId;

			if (options){
				callback = options.callback;
				ownerId = options.ownerId;
				this.id(options.id);
				this.ownerId(ownerId);
			}
			var that = this;
			ajaxAdapter.getRequestRestApi(this.url(), function(res){
				if (res.status === 'success'){
					that.setAttributes(res.result);
					callback && callback();
				}
			})
		},

		// update {secureLevel}
		changeAccess : function (accessValue) {
			var that = this;
			return ajaxAdapter.requestRestApi("/user/" + application.root().currentUser().id() + "/file/" + this.id(), "PUT", { fieldUpdateName : 'access', value : accessValue},function( data ) {
				that.secureLevel(accessValue);
			});
		},

		// update {deleted}
		restore :  function () {
			var that = this;
			return ajaxAdapter.requestRestApi("/user/" + application.root().currentUser().id() + "/file/" + that.id(), "PUT", { fieldUpdateName : 'delete', value : 0 },  function (data, textStatus) { // вешаем свой обработчик на функцию success
				if (data.status == 'success') {
					that.deleted(false);
				}
			});
		},

		// update {deleted}
		delete : function () {
			var that = this;
			return ajaxAdapter.requestRestApi("/user/" + application.root().currentUser().id() + "/file/" + that.id(), "PUT", { fieldUpdateName : 'delete', value : 1 }, function (data, textStatus) { // вешаем свой обработчик на функцию success
				if (data.status == 'success') {
					that.deleted(true);
				}
			});
		},

		// update {?}
		copyToMyLibrary : function() {
			var that = this;
			return ajaxAdapter.requestRestApi("/user/"+application.root().currentUser().id()+"/file", "POST", { file_id : this.id()},  function( data ) {
				if (data.status == 'success') {
					that.availableInLibrary(true);
				}
			});
		},

		// update {title}
		saveNewTitle: function(){
			return ajaxAdapter.requestRestApi("/user/" + application.root().currentUser().id() + "/file/" + this.id(), "PUT", { fieldUpdateName: 'title', value: this.newTitle()}, function (data, textStatus) {

			});
		}
	});
});