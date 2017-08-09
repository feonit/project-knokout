define([
	'_',
	'page',
	'mediator',
	'knockout'
], function(
	_,
	page,
	mediator,
	ko
){

	"use strict";

	return new Router({
		routes: [
			{ url: '/(calendar)?',          											params: { page: 'calendar-page'			, header: 'header-bar-general' } },
			{ url: '/news',     														params: { page: 'news-page'				, header: 'header-bar-general' } },
			{ url: '/dialogs(/:idUser)?',												params: { page: 'dialogs-page'			, header: 'header-bar-general' } },
			{ url: '/webinar/create',     												params: { page: 'webinar-create-page'	, header: 'header-bar-general' } },
			{ url: '/webinar/create/:repeatWebinarId',     								params: { page: 'webinar-create-page'	, header: 'header-bar-general' } },
			{ url: '/module/user/profile/edit',     									params: { page: 'profile-page'			, header: 'header-bar-general' 		, userId: parseInt(!appConfig.auth.guest && appConfig.auth.user.info.id, 10) } },
			{ url: '/webinar/start/:webinarId',     									params: { page: 'webinar-start-page'	, header: 'header-bar-webinar'		, userId: !appConfig.auth.guest && appConfig.auth.user.info.id } },
			{ url: '/webinar/view/:id',     											params: { page: 'webinar-view-page'		, header: 'header-bar-general' } },
			{ url: '/webinar/edit/:editWebinarId',     									params: { page: 'webinar-create-page'	, header: 'header-bar-general' } },
			{ url: '/module/user/auth/login',     										params: { page: 'login-page'			, modeName: '' } },
			{ url: '/module/user/register/confirm/confirm_code/:code',     				params: { page: 'login-page'			, modeName: 'after_activation' } },
			{ url: '/module/user/auth/confirmEmail/confirm_code/:code',     			params: { page: 'login-page'			, modeName: 'after_change_email' } },
			{ url: '/module/user/restorePassword/changePassword/confirm_code/:code',    params: { page: 'login-page'			, modeName: 'after_rememer_password' } },
			{ url: '/module/user/profile/view/:userId',     							params: { page: 'profile-friends-page'	, header: 'header-bar-general' } },
		]
	});

	function Router(config){

		var pathNameIsChange,
			firstPathName = true,
			currentPathName,
			newPathName;

		page('*', function(ctx, next){

			var path = ctx.state.path;
			var anchorIndex = path.indexOf('#');
			var queryIndex = path.indexOf('?');
			var hasAnchor = anchorIndex !== - 1;
			var hasQuery = queryIndex !== -1;

			if (hasAnchor || hasQuery){
				var both = hasAnchor && hasQuery;
				var whereCutIndex;

				if (both){
					whereCutIndex = Math.min(anchorIndex, queryIndex);
				} else {
					whereCutIndex = hasAnchor ? anchorIndex : queryIndex;
				}

				newPathName = path.slice(0, whereCutIndex);
			} else {
				newPathName = path;
			}

			pathNameIsChange = currentPathName !== newPathName;

			function callback(ctxDeferred, ctxRewritePrev){
				if (ctxDeferred){                   // process ctx if was deferred
					if (ctxRewritePrev){
						ctxRewritePrev.save();      // rewrite current state to custom(preview of webinar page)
					}
					ctxDeferred.pushState();        // continue deferred state
				}

				currentPathName = newPathName;      // save current pathname
				next();                             // continue process route handler
			}

			if (pathNameIsChange || firstPathName){
				closeOpenedComponents(ctx, callback);
			} else {
				// here tab is change
			}

			if (!firstPathName){
				mediator.publish('close_opened_components');
			}

			firstPathName = false;

			var parts = ctx.querystring.split('&');
			var data = {};
			parts.forEach(function(part){
				var split = part.split('=');
				data[split[0]] = split[1]
			});

			// обработка параметров типа ?chat=2 для открытия чата
			if (data['chat']){
				window.application.mediator.inQueue('DIALOG_FRAME', 'open_dialog', data['chat']); // todo изолировать application
			}

			// обработка параметров типа ?file=2 для открытия файла
			if (data['file']){
				window.application.mediator.inQueue('PREVIEW_FRAME', 'show:my:file', data['file']); // todo изолировать application
			}
		});

		var currentRoute = this.currentRoute = ko.observable({});

		ko.utils.arrayForEach(config.routes, function(route) {
			page(route.url, function(ctx) {
				var newRoute = ko.utils.extend(ctx.params, route.params),
					isEqual = _.isEqual(currentRoute(), newRoute);

				if (!isEqual){
					currentRoute(newRoute);
				}
			});
		});

		var that = this;

		function closeOpenedComponents(ctxDeferred, callback){
			var application = window.application;// todo вынести отсюда

			if (application.root().uiEvent && application.root().uiEvent() && application.root().uiEvent().opened()){

				// подтверждение на "покинуть вебинар" имеет смысл только тогда когда он еще не завершен
				if ( application.root().uiEvent().event().status() === 'CLOSED' ) {
					callback(ctxDeferred);
					return;
				}

				ctxDeferred.handled = false;
				application.root().uiEvent().event().showPopupWithCancelConfirm(function(){
					ctxDeferred.handled = undefined;

					// если ты автор вебинара и ты его завершил то предыдущей страницей делаем страницу с информацией о вебинаре
					// если ты НЕ автор вебинара и ты из него вышел, то можно вернуться обратно
					if (application.root().uiEvent().event().isAuthor()){
						callback(ctxDeferred);
					} else {
						var urlWebinarView = '/webinar/view/' + application.root().uiEvent().event().event_id();

						var newContext = new page.Context(urlWebinarView); //todo: page callback not fired !!!
						newContext.params['0'] = urlWebinarView; //todo: page callback not fired !!!

						callback(ctxDeferred, newContext);
					}
				});
			} else {
				callback();
			}
		}

		this.stop = function(){
			pathNameIsChange = undefined;
			firstPathName = true;
			currentPathName = undefined;
			newPathName = undefined;
			page.stop.apply(page, arguments);
			page.callbacks = [];
		};

		page('*', function(ctx){
			if (ctx.pathname === '/module/user/auth/logout'){
				location.href = ctx.pathname;
			} else {
				that.redirectToMainPage();
				console.error('Page not found :(');
			}
		});

		this.page = page;

		// повтор вебинара
		this.redirectToCreateWebinarPage = function(id){
			page.show('/webinar/create/' + id);
		};

		this.redirectToWebinarViewPage = function(id){
			page.show('/webinar/view/' + id);
		};

		this.redirectToLoginPage = function(){
			location.href = '/module/user/auth/login';
		};

		this.redirectToGeneralPage = function() {
			page.redirect('/');
		};

		this.redirectToMainPage = function(){
			location.href = '/';
		};

		this.redirectToMyProfile = function(){
			page.show('/module/user/profile/edit');
		};

		this.generateUrlToAlianProfile = function(id){
			return '/module/user/profile/view/' + id + '#tab1';
		};

		this.generateUrlToMyProfile = function(){
			return '/module/user/profile/edit#tab1';
		};

		this.generateUrlToChatUser = function(id){
			return this.getLocationWithoutParms() + '?chat=' + id;
		};

		this.generateUrlToMyFile = function(id){
			return this.getLocationWithoutParms() + '?file=' + id;
		};

		this.getLocationWithoutParms = function(){
			var queryIndex = location.href.indexOf('?');
			return queryIndex === -1 ? location.href : location.href.slice(0, queryIndex);
		};

		//proxy
		this.redirect = function(){
			return page.redirect.apply(page, arguments);
		};
		//proxy
		this.start = function(){
			return page.start.apply(page, arguments);
		};

		if ("onhashchange" in window) {
			window.onhashchange = function(hashChangeEvent){
				closeOpenedComponents(null, function(){
					var application = window.application;// todo вынести отсюда
					application.api.tabs.renderWithHashComponents();
				});
			};
		}
	}
});