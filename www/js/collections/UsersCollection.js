define(['knockout', 'Collection', 'UserModel'], function(ko, Collection, UserModel){

	"use strict";

	/**
	 * @class UsersCollection
	 * */
	var UsersCollection = Collection.extend({
		url: function(){
			return '/user/' + this.id + '/subscribers';
		},
		urlSearch: function(){
			return "/search/colleagues" + (this.id ? ("/" + this.id) : '')
		},

		model: UserModel,

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

		/**
		 * @this {}
		 * @param {Function} callback
		 * */
		filterCallback: function(callback){
			var models = this.models(),
				filterItems = [];

			for (var index in models) {
				var value = models[index];
				if (callback(value)) {
					filterItems.push(value);
				}
			}
			return filterItems;
		},

		getConfirmedColleaguesUsers: function(){
			return this.filterCallback(function (value) {
				return (value.confirmed() == true && value.sendInvite() == true);
			});
		},

		/**
		 * @this {}
		 * todo to collection method findWhere
		 * */
		filter: function(field, searchValue){
			var models = this.models(),
				filtered = [], index;

			for (index in models) {
				var value = models[index];
				if (value[field]() == searchValue) {
					filtered.push(models[index]);
				}
			}
			return filtered;
		}
	});

	return UsersCollection;
});