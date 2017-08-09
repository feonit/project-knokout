define([
	'knockout',
	'ajaxAdapter',
	'application'
], function(
	ko,
	ajaxAdapter,
	application
){

	"use strict";

	return function StreamerControlModel() {

		this.event_id = ko.observable();
		this.fileModel = ko.observable();
		this.type = ko.observable();
		this.pageCount = ko.observable();
		this.position = ko.observable();
		this.file_id = ko.observable();			// id воспроизводимого файла

		// 'MEDIA_NO_SELECTED' - нет воспроизводимого файла
		// 'MEDIA_RESOLVING', - файл находится на рассмотрении модератора
		// 'MEDIA_PLAYING',   - файл проигрывается
		// 'MEDIA_PAUSED'     - файл на паузе
		this.statusMedia = ko.observable('MEDIA_NO_SELECTED');

		this.setParams = function(params){
			this.event_id(params.event_id);
			this.fileModel(params.fileModel);
			this.type(params.type);
			this.pageCount(params.pageCount);
			this.position(params.position);
			this.file_id(params.file_id);
			this.statusMedia(params.statusMedia);
		};

		this.isActive = ko.computed(function(){
			return !!this.fileModel();
		}, this);

		this.isMediaFile = ko.computed(function(){
			return this.type() === 'MEDIA'; // or STATIC
		}, this);
		/**
		 * destroy process method
		 * */
		this.destroy = function(){
			this.stopStream();
			this.fileModel(undefined);
			this.event_id(undefined);
			this.type(undefined);
			this.pageCount(undefined);
			this.position(undefined);
			this.file_id(undefined);
			this.statusMedia('MEDIA_NO_SELECTED');
		};
		this.destroyOnlyInterface = function(){
			this.fileModel(undefined);
			this.event_id(undefined);
			this.type(undefined);
			this.pageCount(undefined);
			this.position(undefined);
			this.file_id(undefined);
		};
		/**
		 * handler for view
		 * */
		this.onPrevButtonClick = function(){
			this.prevPage();
		};
		/**
		 * handler for view
		 * */
		this.onNextButtonClick = function(){
			this.nextPage();
		};
		/**
		 * handler for view
		 * */
		this.onCloseButton = function(){
			this.destroy();
		};
		/**
		 * handler for view
		 * */
		this.onBarPlayButtonClick = function(model, event){
			switch (this.statusMedia()) {
				case 'MEDIA_PLAYING':
					this.statusMedia('MEDIA_PAUSED');
					this.pauseStream(); break;
				case 'MEDIA_PAUSED':
					this.statusMedia('MEDIA_PLAYING');
					this.playStream(); break;
			}
		};

		/**
		 * AJAX
		 * */
		this.startStream = function () {
			return ajaxAdapter.requestRestApi("/webinar/" + this.event_id() +"/control", "POST", { action:'stream_start', file_id: this.file_id() }, function( data ) {
				if (data.status == 'success') {

				}
			});
		};
		/**
		 * AJAX
		 * */
		this.pauseStream = function () {
			return ajaxAdapter.requestRestApi("/webinar/" + this.event_id() + "/control", "POST", { action: 'stream_pause', file_id: this.file_id() }, function( data ) {});
		};
		/**
		 * AJAX
		 * */
		this.playStream = function () {
			return ajaxAdapter.requestRestApi("/webinar/" + this.event_id() + "/control", "POST", {'action':'stream_play', file_id: this.file_id() }, function( data ) {});
		};
		/**
		 * AJAX
		 * */
		this.stopStream = function () {
			return ajaxAdapter.requestRestApi("/webinar/" + this.event_id() + "/control", "POST", {'action':'stream_stop', file_id: this.file_id()}, function( data ) {
				if (data.status == 'success') {

				}
			});
		};
		/**
		 * AJAX
		 * */
		this.goToPage = function (page) {
			this.position(page);
			return ajaxAdapter.requestRestApi("/webinar/" + this.event_id() + "/control", "POST", { action:'stream_goto', file_id: this.file_id() , 'position': page}, function(data){

			});
		};
		this.nextPage = function () {
			var next = this.position() + 1;
			if ( next <= this.pageCount()){
				this.position(next);
				this.goToPage(next);
			}
		};
		/**
		 * AJAX
		 * */
		this.prevPage = function () {
			var prev = this.position() - 1;

			if ( prev >= 1 ){
				this.position(prev);
				return ajaxAdapter.requestRestApi("/webinar/" + this.event_id() + "/control", "POST", { action:'stream_goto', file_id: this.file_id() , 'position': prev}, function(data){

				});
			}
		};
	};
});
