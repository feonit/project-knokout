define([
    '_',
    'cookieStoreManager',
    'mediator',
    'jquery',
    'knockout',
    'ajaxAdapter',
    'mustache',
    'router',
    'json!componentsMap',
    'json!ruLanguage',

    'Collection',
    'mediator',
    'Model',
    'View',
    'raven',
    'ravenConfig',
], function(
    _,
    cookieStoreManager,
    mediator,
    $,
    ko,
    ajaxAdapter,
    mustache,
    router,
    componentsMap,
    ruLanguage
){

    "use strict";

    function Application(appConfig){
        if (!appConfig){
            throw new Error('Not defined appConfig')
        }
        this.VERSION = appConfig.info.build;
        this.USER_DATA = {
            browser: {
                isChrome : navigator.userAgent.toLowerCase().indexOf('chrome') > -1
            },
            system: {
                isAndroid: navigator.userAgent.indexOf('Android') > -1
            },
            userLanguage: (function(){
                var configLanguage,
                    browserLanguage,
                    storedLanguage,
                    DEFAULT_LANGUAGE = "ru",
                    SUPPORTED_LANGUAGES = {
                        ru: true,
                        en: true,
                        fr: false
                    },
                    isSupported = false;

                try {
                    browserLanguage = (window.navigator.language || navigator.userLanguage || window.navigator.browserLanguage || window.navigator.systemLanguage || DEFAULT_LANGUAGE).split('-')[0].toLowerCase();
                    // if the local language is not supported by the application
                    isSupported = SUPPORTED_LANGUAGES[browserLanguage];

                    if (!isSupported){
                        browserLanguage = DEFAULT_LANGUAGE;
                    }

                } catch(e) {
                    browserLanguage = undefined;
                    throw Error('local language not defined');
                }

                try {
                    configLanguage = appConfig.auth.user.options.CURRENT_LANGUAGE
                }
                catch (e) {
                    configLanguage = undefined;
                }

                storedLanguage = cookieStoreManager.getLanguage();

                // FIX @DEPRECATED
                if (configLanguage === "undefined"){
                    configLanguage = DEFAULT_LANGUAGE;
                }

                return configLanguage || storedLanguage || browserLanguage || DEFAULT_LANGUAGE;
            }())
        };
        this.options = {
            isGuest : null,
            isSpa : true
        };
        this.isBindedWithKnockout = false;
        this.isStarted = false;
        this.api = {};
        this.config = appConfig;
        this.root = ko.observable();
        this.$window = $(window);
        this.$document = $(document);
        this.$body = $('body');

        window.application = this;
    }

    Application.prototype = {

        start : function(){
            this.options.isGuest = this.config.auth.guest;

            var that = this;

            this._defineLocalization(function(){
                that._defineCustomTemplateEngine(mustache, that.translation);
                that._registerComponents(componentsMap);
                that._defineBaseModel();
                that._defineApi();
                that.mediator = mediator;
                that._initializeRouter();
                that.isStarted = true;
            });

            return this;
        },

        /**
         * Completely stop the application (just experimental)
         * */
        stop : function(callback){
            if (!this.isStarted) return;

            this._undefRequireModules();
            this._stopProcesses();
            this._resetStateOfUserInterfaces();

            this.isStarted = false;

            callback && callback.call(this)
        },

        /**
         * Resetting specific modules
         * */
        _undefRequireModules: function(){

        },

        /**
         * Stop the operation of communications
         * */
        _stopProcesses: function(){
            // todo abort ajax requirest and handlers
            // todo close sockets and eventSource eventSource.close();
        },

        /**
         * Reset the user interface
         * */
        _resetStateOfUserInterfaces: function(){
            this.root && this.root.tabs && (this.root.tabs.components = []);

            this.api.tabs.removeAllTabComponents();
            this.router.stop();
            //this.user_actions.destroyInstance(); // todo
            this.root('');
        },

        restart: function(){
            // todo context infrastructure

            if (this.options.isGuest){
                var that = this;

//					this.stop(function(){
//						that.start();
//					});
                window.location.reload(); // replace when 'stop' experimental functionality will be completed yet

            } else {
                window.location.reload();
            }
        },

        _defineCustomTemplateEngine : function (Mustache, translation){

            var templateFromUrlLoader = {
                loadTemplate: function(name, templateConfig, callback) {
                    if (typeof templateConfig === 'string') {

                        var markupString = Mustache.render(templateConfig, translation);

                        ko.components.defaultLoader.loadTemplate(name, markupString, callback);

                    } else {
                        // Unrecognized config format. Let another loader handle it.
                        callback(null);
                    }
                }
            };

            //
            // Режим продакшен или девелоп
            //
            if (appConfig.info.environment === 'alpha'){
                templateFromUrlLoader.getConfig = function(name, configCallback) {
                    // хак, после сборки вебпака, параметры функции почему то теряются, поэтому использую arguments
                    // не понятно почему вместо name приходит уже компонет конфиг

                    var registeredData = ko.components._allRegisteredComponents[arguments[0]];
                    var subpath;

                    if (registeredData.require){
                        subpath = registeredData.require.replace('components/','');
                    } else {
                        // is ready data of viewModel and template
                        //If you do not want your loader to supply a configuration for the named component, then call
                        configCallback(registeredData);
                        return;
                    }

                    require(['../components/' + subpath + '.js'], function(callback){

                        if (typeof callback === "function"){
                            callback(function(data){
                                configCallback(data);
                            });
                        } else {
                            configCallback(callback);

                        }

                    });
                }
            }

            // Register it
            ko.components.loaders.unshift(templateFromUrlLoader);
        },

        _defineBaseModel : function(){
            var that = this;


            function _isObject(someObject){
                return Object.prototype.toString.call( someObject ) === '[object Object]';
            }

            ko.extenders.moduleName = function(target, option) {
                target.subscribe(function(oldValue){
                    var instance = oldValue;

                    if (_isObject(instance)){
                        var supportDestroyMethod = !!instance['destroyInstance'] && (typeof instance['destroyInstance'] === "function");

                        if (supportDestroyMethod){
                            instance['destroyInstance']();
                        }
                    }
                }, null, "beforeChange");

                target.subscribe(function(newValue){
                    var instance = newValue;

                    if (_isObject(newValue)){
                        var supportInitializeMethod = !!instance['initializeInstance'] && (typeof instance['initializeInstance'] === "function");

                        if (supportInitializeMethod){
                            instance['initializeInstance']();
                        }
                    } else{
                        if (newValue === ""){
                        }
                    }
                });
                return target;
            };

            function App() {
                return _.mix(Object.create(null), {
                    languages: ko.observable('').extend({moduleName: 'languages'}),
                    ajaxAdapter: ko.observable().extend({moduleName: 'ajaxAdapter'}),
                    loginViewModel: ko.observable('').extend({moduleName: 'loginViewModel'}),
                    chat: ko.observable().extend({moduleName: 'chat'}),
                    dialogs: ko.observable('').extend({moduleName: 'dialogs'}),
                    eventModel: ko.observable('').extend({moduleName: 'eventModel'}),
                    currentUser: ko.observable('').extend({moduleName: 'currentUser'}),
                    alienUser: ko.observable('').extend({moduleName: 'alienUser'}),
                    webinarsCollection: ko.observable('').extend({moduleName: 'webinarsCollection'}),
                    uiEvent: ko.observable('').extend({moduleName: 'uiEvent'}),
                    colleagues: ko.observable('').extend({moduleName: 'colleagues'}),
                    library: ko.observable('').extend({moduleName: 'library'}),
                    alienLibrary: ko.observable('').extend({moduleName: 'alienLibrary'}),
                    search: ko.observable().extend({moduleName: 'search'}),
                    calendar: ko.observable(''),
                    userSettings: ko.observable('').extend({moduleName: 'userSettings'}),
                    news: ko.observable('').extend({moduleName: 'news'}),
                    catalogViewModel: ko.observable('').extend({moduleName: 'catalogViewModel'}), // для каунтеров на вкладках
                    countersModel: ko.observable()
                });
            }

            var baseModel = new App; baseModel.constructor = App;

            that.root(baseModel);
            window.app = baseModel; // for tabComponents

            return baseModel;
        },

        _defineApi : function (){
            var that = this;
            if ( !that.options.isGuest ){
                ajaxAdapter.deferred(true);
            }
            that.root().ajaxAdapter(ajaxAdapter);
            window.ajaxAdapter = ajaxAdapter;
        },

        _registerKnockoutBindingsOnce : function (app){
            if (!this.isBindedWithKnockout){

                this.isBindedWithKnockout = true;

                $( document ).ready(function() {

                    ko.applyBindings(app, document.getElementsByTagName('html')[0]);

                });
            }
        },

        _defineLocalization: function(callback){
            var that = this,
                language = that.USER_DATA.userLanguage;

            if (language === 'ru'){

                window.translation = that.translation = ruLanguage;

                that.translationJSON = null;

                callback();
            } else {
                $.getJSON('/js/i18n/language/map_ru_to_en.json', function(json){

                    var isArray,
                        value;

                    var getTranslate = function (hash, fn) {
                        for (var key in hash)
                            hash[key] = fn(hash[key]);
                        return hash;
                    };

                    window.translation = that.translation = getTranslate(ruLanguage, function (str){
                        if (json[str]){
                            isArray = "string" !== typeof json[str];

                            value = isArray
                                ? json[str][0][0]
                                : json[str]; //TODO
                        } else {
                            value = str;
                        }

                        return value;
                    });

                    that.translationJSON = json;

                    callback();
                });
            }
        },

        _registerComponents: function(mapSource){
            function mirror(mapSource){
                var components = {};

                function createMapPath(source, subPath, dest){
                    for (var key in source) { if (!source.hasOwnProperty(key)) continue;
                        dest[key] = subPath + '/' + key + '/' + key;
                        createMapPath(source[key], subPath + '/' + key, dest)
                    }
                }

                createMapPath(mapSource, '', components);

                for (var key in components) {if (!components.hasOwnProperty(key)) continue;
                    components[key] = 'components' + components[key];
                }

                return components;
            }

            function registerAll() {
                var components = mirror(mapSource);

                for (var name in components) {
                    if (!components.hasOwnProperty(name)) return;
                    ko.components.register(name, { require: components[name] });
                }
            }

            ko.components.register('body-frame', { require: 'components/body-frame/body-frame' });
            ko.components.register('pages-frame', { require: 'components/pages/pages-frame' });

            registerAll();
        },

        _initializeRouter : function (){
            var that = this;

            that.root().route = router.currentRoute;
            that._registerKnockoutBindingsOnce(that.root);
            router.start({click : that.options.isSpa, dispatch: true});
            that.router = router;
        }
    };

    return new Application(window.appConfig).start();
});