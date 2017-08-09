define([
	'application',
	'router',
	'knockout',
	'Collection',
	'ajaxAdapter',
	'UserModel',
	'FileViewModel',
	'WebinarModel',
	'NewsModel'
], function(
	application,
	router,
	ko,
	Collection,
	ajaxAdapter,
	UserModel,
	FileViewModel,
	WebinarModel,
	NewsModel
){

	"use strict";

	var NewsCollection = Collection.extend({
		url: '/news',
		model: NewsModel,

		catalogue: undefined,

		adapterAnswerData: function(response){
			if (!response.template) throw Error('not found \'template\' at response of server');
			if (!response.data) throw Error('not found \'data\' at response of server');

			this.catalogue = response.template;
			this.total(response.count);

			return response.data;
		},

		parse: function(item){
			var param, newsData, newsTemplate, newsText;

			newsData = item;

			newsTemplate = this.catalogue[newsData.type];

			newsText = newsTemplate.message;

			for (param in newsData.params) {
				if (newsTemplate.links.hasOwnProperty(param)) {
					var url = newsTemplate.links[param];
					for (var iu in newsData.params) {
						url = url.replace(iu, newsData.params[iu])
					}
					if (newsData.type == 'FILE_ADDED') {
						newsText = newsText.replace(param, '<a href="'+url+'" onclick="application.root().news().openFilePreview.apply(this, arguments)" data-file_id="'+newsData.item_id+'" data-author_id="'+newsData.author.id+'">'+newsData.params[param]+'</a>')
					} else {
						newsText = newsText.replace(param, '<a href="'+url+'">'+newsData.params[param]+'</a>')
					}
				} else {
					newsText = newsText.replace(param, newsData.params[param])
				}
			}

			item.text = newsText;
		},

		initialize: function(items, data){
			ko.utils.arrayForEach(items, function(item, index){
				item.userModel().setParams(data[index].author);
			})
		}
	});

	NewsCollection.prototype.mixView({

		constructor: function NewsViewModel(){},

		openFilePreview : function (event){
			event.preventDefault();
			var data = $(this).data();
			var file = new FileViewModel(null, null); //todo ref
			file.fetch({
				ownerId: data.author_id,
				id: data.file_id,
				callback: function(){
					application.mediator.trigger('PREVIEW_FRAME', 'show:file', file)
				}
			});
		},

		/**
		 * AJAX
		 * @return {jqXHR}
		 * */
		inviteConfirm : function (news) {
			var event_id = news.item_id();
			var event = new WebinarModel;
			event.event_id(event_id);

			return event.join(function () {
				application.root().news().models.remove(news);
				router.redirectToWebinarViewPage(event_id);
			});
		},

		/**
		 * AJAX
		 * @return {jqXHR}
		 * */
		inviteCancel : function (news) {
			var event = new WebinarModel;
			event.event_id(news.item_id());
			application.root().eventModel(event);

			event.userCancel(function(){
				return event.inviteCancel(function () {
					application.root().news().models.remove(news);
				});
			});

			// toto return event.inviteCancel... двойной проброс promise
		},

		collagueInviteConfirm : function (news) {
			var user = new UserModel;
			user.id(news.item_id());
			user.subscribe(application.root().currentUser());
			application.root().news().models.remove(news);
		},

		collagueInviteCancel : function (news) {
			var user = new UserModel();
			user.id(news.item_id());
			user.unsubscribe(application.root().currentUser());
			application.root().news().models.remove(news);
		}
	});

	return NewsCollection;
});