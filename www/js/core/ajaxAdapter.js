define([
	'router',
	'jquery',
	'knockout',
], function(
	router,
	$,
	ko
){

	"use strict";

	var AjaxAdapter = function () {
		this.host = window.location.origin;
		this.basePath = '/restapi';
		this.hostStatic = appConfig.auth.user.staticUrl;
		this.basePathStatic = '/api/v1';
		this.token = appConfig.auth.fileApiToken;

		this.deferredMode = false;
		this.deferredRequests = [];
		this.counterOfRequiest = ko.observable();
		this.showPreloader = ko.computed(function(){
			return this.counterOfRequiest() > 1;
		}, this);
	};

	AjaxAdapter.prototype = new function AjaxAdapterPrototype(){

		/**
		 * @public
		 * */
		this.deferred = function (flag) {
			var that = this;

			if (flag == false) {
				that.deferredMode = false;
				console.log('Call deferred requests');
				for (var i in that.deferredRequests) {
					that.request(that.deferredRequests[i].url, that.deferredRequests[i].method, that.deferredRequests[i].data, that.deferredRequests[i].callback, true, true);
				}
			} else {
				that.deferredMode = true;
			}
		};

		this.getToken = function(){
			return this.token;
		};

		this.getFullUrl = function(url) {
			return this.host + this.basePath + url;
		};

		this.getStaticFullUrl = function(url){
			return this.hostStatic + this.basePathStatic + url;
		};

		this.getStaticApi = function(url){
			return this.hostStatic + 'api/' + url;
		};

		this.getStaticUrlBaseUrl = function(url){
			return this.hostStatic + url;
		};

		this.getStaticFullUrlBaseUrl = function(url){
			return this.hostStatic + this.basePathStatic + url;
		};

		this.getFullUrlWithoutBase = function(url) {
			return this.host + url;
		};

		this.getStaticFullUrlWithoutBase = function(url){
			return this.hostStatic + url;
		};

		this.requestRestApi = function(){
			arguments[0] = this.getFullUrl(arguments[0]);
			return this.request.apply(this, arguments)
		};

		this.requestStaticRestApi = function(){
			arguments[0] = this.getStaticFullUrlBaseUrl(arguments[0]);
			return this.request.apply(this, arguments)
		};

		this.getRequestRestApi = function(url, callback, data){
			return this.request.call(this, this.getFullUrl(arguments[0]), 'GET', data, callback);
		};

		this.getRequestStaticRestApi = function(url, callback, data){
			return this.request.call(this, this.getUrlStaticApi(arguments[0]), 'GET', data, callback);
		};

		this.getUrlStaticApi = function(substr){
			return this.hostStatic + this.basePathStatic + substr + '?token=' + this.token;
		};


		var TIMEOUT_FOR_RELOAD_PAGE_ON_ERROR = 3000;

		/**
		 * @public
		 * */
		this.request = function (url, method, data, callback, ignoreDeferredMode, deferredCall) {
			var that = this;

			if (typeof method ==='undefined' || !method.toUpperCase){
				//['get', 'post'].indexOf('post')
				throw Error('method not found');
			}

			if (typeof callback === 'undefined'){
				callback = function(){};
			}

			method = method.toUpperCase();

			if (this.deferredMode == true && ignoreDeferredMode != true) {
				this.deferredRequests.push({
					url: url,
					method: method,
					data: data,
					callback: callback
				});
				return false;
			} else {

				this.counterOfRequiest(this.counterOfRequiest() + 1);

				var jqXHR = $.ajax({
					dataType: "json",
					url: url,
					type: method,
					data: data
				});

				jqXHR.done(function (response) {
					if (!response)
						throw new Error('Response from server was lost');
					if (!response.status)
						throw new Error('Status of response from server was lost');
					if (typeof response.result === 'undefined')
						throw new Error('Result of request from server is undefined');
					//if (typeof response.result.data === 'undefined') throw new Error('Data of request from server is undefined');
					// request of settings not have the data filed

					if (response.status === 'error'){
						router.redirectToMainPage();
						throw Error('Answer error from server at url: ' + url);
					}

					if (response.status === 'unauthorized'){
						router.redirectToLoginPage();
					}

					if (response.status === 'forbidden'){

					}

					if (response.status === 'success'){

					}

					callback(response);
					console.log('Ajax done: ' + url);
				});

				jqXHR.fail(function (jqXHR, textStatus, errorThrown) {
//					if (jqXHR && jqXHR.status === 500) { // Server Error
//						setTimeout(function(){
//							location.reload();
//						}, TIMEOUT_FOR_RELOAD_PAGE_ON_ERROR);
//					}
					if (jqXHR && jqXHR.status === 403) { // Forbidden
//						alert('Forbidden. The page will be reloaded'); // Сессия устарела, нужно перезагрузить страницу
						router.redirectToGeneralPage();
					}

					that.counterOfRequiest(that.counterOfRequiest() - 1);
					console.log('Ajax fail: ' + ', ' + url);
					console.warn(errorThrown);
				});

				jqXHR.always(function (){
					that.counterOfRequiest(that.counterOfRequiest() - 1);
				});

				return jqXHR;
			}
		};

		var subscriber;

		this.initializeInstance = function(){
//			subscriber = this.showPreloader.subscribe(function(value){
//				value === true
//					? glbPreloadShow()
//					: glbPreloadHide()
//			}, this);

			this.counterOfRequiest(0);
		};

		this.glbPreloadShow = function(){
			$(".preloader_background").animate({opacity: "show"}, 300);
			$(".upper_preloader").animate({opacity: "show"}, 300).addClass("preloader");
		};

		this.glbPreloadHide = function () {
			$(".preloader_background").animate({opacity: "hide"}, 300);
			$(".upper_preloader").animate({opacity: "hide"}, 300).removeClass("preloader");
		};

		this.destroyInstance = function(){
			this.counterOfRequiest(void 0);

			if (subscriber){
				subscriber.dispose();
			}
		}
	};

	return new AjaxAdapter;
});