define([
	'knockout',
	'text!components/pages/news-page/news-page.html',
	'application',
	'NewsCollection'
], function (
	ko,
	template,
	application,
	NewsCollection
) {

	"use strict";

	function Component(params) {
		this.afterRender();
	}

	Component.prototype = {
		constructor: Component,


		afterRender: function(){
			var app = application.root();
			app.news(new NewsCollection());

			app.news().lazyFetch();

			application.mediator.subscribe('page_scrolled_bottom', app.news().lazyFetch, app.news());

			application.$body.eventRegister({
				news_create: function (event, params) {
					setTimeout(function(){
						app.news().updateLazyFetch(); // todo костыль при подтверждении статуса коллеги confirmed не успевает устанавливаеться в true
					}, 500);
				},
				user_counter_update : function(){
					app.news().updateLazyFetch(); // todo костыль, должно приходить news_create с сервера вместо user_counter_update
				}
			});
		},

		dispose: function(){
			application.$body.eventUnRegister('news_create');
			application.$body.eventUnRegister('user_counter_update');
			application.mediator.unsubscribe('page_scrolled_bottom', application.root().news().lazyFetch);
		}
	};

	return { viewModel: Component, template: template }
});