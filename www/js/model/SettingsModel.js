define([
    'application',
    'knockout',
    'ajaxAdapter',
    'cookieStoreManager'
], function(
    application,
    ko,
    ajaxAdapter,
    cookieStoreManager
){

    "use strict";

    ko.extenders.name = function(target, option) {
        target.attrName = option;
        return target;
    };

    var SettingsModel = function (data) {
        var that = this,
            cache,
            isNeedShowModal = true;

        this.USER_THEME = ko.observable().extend({ name: 'USER_THEME' });
        this.CURRENT_LANGUAGE = ko.observable().extend({ name: 'CURRENT_LANGUAGE' });
        this.LIBRARY_ACCESS_LEVEL = ko.observable().extend({ name: 'LIBRARY_ACCESS_LEVEL' });
        this.WEBINAR_ACCESS_LEVEL = ko.observable().extend({ name: 'WEBINAR_ACCESS_LEVEL' });
//		this.USER_TIMEZONE = ko.observable().extend({ name: 'USER_TIMEZONE' });

        this.loaded = ko.observable(false);

        this.applicantForChange = ko.observable('');

        this.save = function (param, attrName, callback) {
            var paramName = attrName || param.attrName;
            var params = {};

            params[paramName] = that[paramName]();

            return ajaxAdapter.requestRestApi('/user/'+ application.root().currentUser().id()+'/settings', 'PUT', params, function (data) {
                if (data.status == 'success') {
                    ko.mapping.fromJS(data.result, {}, that);
                }
                callback && callback();
            })
        };

        this.load = function(user_id, callback) {
            var that = this;

            var url = ajaxAdapter.getFullUrl('/user/'+ user_id +'/settings');

            ajaxAdapter.getRequestRestApi(url, function (data) {
                if (data.status == 'success') {
                    ko.mapping.fromJS(data.result, {}, that);
                    if (typeof(callback) === 'function') {
                        callback.call(that, data.result);
                    }
                    that.loaded(true);
                }
            });
        };

        this.saveApplicant = function(){
            this.save(this.applicantForChange());
            isNeedShowModal = !isNeedShowModal;
        };

        this.dropApplicant = function(){
            this.applicantForChange()(cache);// revert old value
            this.applicantForChange('');//drop link
            $('.user_profile_option').trigger('refresh');
        };


        if (data){
            ko.mapping.fromJS(data, {}, this);
            this.loaded(true);
        }

        this.checkCookieAndUserCustomSettings = function(){
            var languageCookie = cookieStoreManager.getLanguage(),
                languageUserCustom = application.root().userSettings().CURRENT_LANGUAGE(),
                themeCookie = cookieStoreManager.getTheme();

            // languageCookie != null
            if ( languageCookie && (languageUserCustom !== languageCookie) ){
                this.CURRENT_LANGUAGE(languageCookie);
            }

            if (!themeCookie){
                cookieStoreManager.setTheme(this.USER_THEME())
            }
        };

        // initialize after set data

        this.USER_THEME.subscribe(function (value) {
            $('#style_theme').prop('href', window.location.origin + "/css/style_" + value + ".css");
            that.save(null, 'USER_THEME', function(){
                cookieStoreManager.setTheme(value);
            })
        }, this);

        this.CURRENT_LANGUAGE.subscribe(function(value){
            that.save(null, 'CURRENT_LANGUAGE', function(){
                application.USER_DATA.userLanguage = value;
                cookieStoreManager.setLanguage(value);
                application.restart();
            });
        }, this);

        var showModalWindow = function (target, oldValue){
            if (isNeedShowModal){
                that.applicantForChange(target); //!
                application.api.popupModule.createPopup({
                    templateName : 'popup-update_access'
                });
                cache = oldValue;
            }
            isNeedShowModal = !isNeedShowModal;
        };

        var that = this;
        this.LIBRARY_ACCESS_LEVEL.subscribe(function (oldValue) {
            showModalWindow(that.LIBRARY_ACCESS_LEVEL, oldValue);
        }, null, "beforeChange");

        this.WEBINAR_ACCESS_LEVEL.subscribe(function (oldValue) {
            showModalWindow(that.WEBINAR_ACCESS_LEVEL, oldValue);
        }, null, "beforeChange");
    };

    return SettingsModel;
});