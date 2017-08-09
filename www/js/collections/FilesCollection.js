define([
	'knockout',
	'FileViewModel',
	'Collection',
	'show_tooltip'
], function(
	ko,
	FileViewModel,
	Collection
){

	'use strict';

	var FilesCollection = Collection.extend({

		url: function(){
			return '/user/' + this.id + '/file';
		},

		urlSearch: function(){
			return '/search/library/' + this.id;
		},

		model: FileViewModel,

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
		},


		findByXhr : function (id) {
			for (var i in this.models()) {
				if (this.models()[i].xhr_uid() == id) {
					return this.models()[i];
				}
			}
			return false;
		},

		findById : function (id) {
			for (var i in this.models()) {
				if (this.models()[i].id() == id) {
					return this.models()[i];
				}
			}
			return false;
		}
	});

	return FilesCollection;
});