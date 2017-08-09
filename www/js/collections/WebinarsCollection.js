define(['knockout', 'WebinarModel', 'Collection'], function(ko, WebinarModel, Collection){

	"use strict";

	/**
	 * @class WebinarsCollection
	 * */

	var WebinarsCollection = Collection.extend({
		url : function(){
			return '/user/' + this.id + '/webinar';
		},

		urlSearch : function(){
			return "/search/event" + (this.id ? ("/" + this.id) : '');
		},

		model: WebinarModel,

		adapterAnswerData: function(response){
			if (typeof response.count !== 'undefined'){
				this.total(response.count);
			} else {
				// отсутствие каунтера - условный признак работы с результатом поиска

				response.data.user.forEach(function(elem){
					elem['search_type'] = 'user';
				});
				response.data.global.forEach(function(elem){
					elem['search_type'] = 'global';
				});

				response.data = (response.data.user).concat(response.data.global);
			}
			return response.data;
		}
	});

	return WebinarsCollection;
});