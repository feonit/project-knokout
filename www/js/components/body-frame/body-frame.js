define([
    'application',
    'cookieStoreManager',
    'SettingsModel',
    'SearchModel',
    'LanguagesModel',
    'UserModel',
    'ajaxAdapter',
    'user_actions',
    'text!components/body-frame/body-frame.html',
    'CountersModel',

    'jquery.touchswipe',
    'jquery.formstyler',
    'eventSourceAdapter',
    'site_effects',
    'knockout.keybind',
    'knockout.animatetext',
    'knockout.validation',
    'renderTabsBindingHandlers'
], function (
    application,
    cookieStoreManager,
    SettingsModel,
    SearchModel,
    LanguagesModel,
    UserModel,
    ajaxAdapter,
    user_actions,
    template,
    CountersModel
) {

    "use strict";

    function Component(params) {
        this.route = params.route;
        this.layout = ko.observable(); // authorized || noAuthorized || serverError
        this.afterRender();
    }

    Component.prototype = {
        constructor : Component,

        start : function(){
            var allUserModel = [];

            var app = application.root();
            app.search(new SearchModel());
            app.currentUser(new UserModel());
            app.languages(new LanguagesModel());
            app.userSettings(new SettingsModel(appConfig.auth.user.options));
            app.countersModel(new CountersModel(appConfig.auth.user.counters.invites, appConfig.auth.user.counters.dialogs));

            app.search().opened.subscribe(function(isOpened){
                var handler = app.search().closeForce;
                isOpened
                    ? application.mediator.subscribe('close_opened_components', handler, this)
                    : application.mediator.unsubscribe('close_opened_components', handler)
            });

            window.UserModel = UserModel; //todo hack for badge template
            window.allUserModel = allUserModel;

            app.userSettings().checkCookieAndUserCustomSettings();
            app.currentUser().setParams(appConfig.auth.user.info, function(){

                var offset = new Date().getTimezoneOffset()/60;

                ajaxAdapter.requestRestApi('/user/'+ appConfig.auth.user.info.id +'/settings', 'PUT', {'USER_TIMEZONE': offset}, function () {
                    ajaxAdapter.deferred(false);
                }, true);

                user_actions.userOnlineCheck();
            });

            if (window.appConfig.eventSource) {
                for(var len = window.appConfig.eventSource.length; len > 0; len--){
                    application.$body.subscribeToChannel(window.appConfig.eventSource[len-1]);
                }
            }
        },

        stop : function(){
            var app = application.root();

            app.userSettings(undefined);
            app.currentUser(undefined);
            app.languages(undefined);
            app.search(undefined);
        },

        onArrowButtonClick: function() {
            var target = $(savedTarget) || $(".middle_main_content");
            target.animate({scrollTop:0}, 200);
        },

        afterRender: function(){
            var appConfig = window.appConfig;

            if (appConfig.error){
                if (appConfig.controller.exception_code == 404){
                    application.router.redirectToMainPage();
                } else {
                    this.layout('serverError');
                }
                return;
            }
            if (appConfig.auth.guest) {
                this.layout('noAuthorized');
            } else {
                this.layout('authorized');
                this.start(); // todo rc
            }
        },

        dispose : function() {

        }
    };

    return { viewModel: Component, template: template }
});