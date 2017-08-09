'use strict';

var NODE_ENV = process.env.NODE_ENV || 'development';
var webpack = require('webpack'),
    path = require("path"),
    fs = require('fs'),
    buf = fs.readFileSync('./www/js/core/componentsMap.json', 'utf8'),
    buf2 = fs.readFileSync('./package.json', 'utf8'),
    componentsMap,
    packageJSON,
    componentsRegExp = new RegExp("components((\/([a-z\-]*))*)\/((?![a-z\-]*(" +
        "title-html|" +
        "user-badge|" +
        "body-frame|" +
        "popup-frame|" +
        "header-bar|" +
        "notification-bar|" +
        "pages-frame|" +
        "control-search|" +
        "header-bar-general|" +
        "bug-report" +
        "))[a-z\-]*)\.js$");

try{
    componentsMap = JSON.parse(buf);
    packageJSON = JSON.parse(buf2);
} catch (err){
    throw('JSON PARSE ERROR' + err.toString());
}

module.exports = {

    context: __dirname + "/www/js/",

    devtool: NODE_ENV == "development" ? "source-map" : null,

    entry: {
        "infrastructure": ['infrastructure'],
        "application": ['application']
    },

    output: {
        // относительный путь
        path: __dirname + "/www/build/js/",
        filename: "[name].js",              // правило формирования имен для точек входа (бандлов)
        chunkFilename: "[id]__v.-" + packageJSON.version + '__' + (new Date()).toLocaleTimeString() +".js",
        publicPath: '/build/js/'
    },

    plugins: [
        new webpack.NoErrorsPlugin(),

        ( NODE_ENV == "development" ? null
                : new webpack.optimize.UglifyJsPlugin({
                    beautify: false,
                    drop_console: true,
                    "max-line-len": 1000
                }
            )
        ),
        new webpack.optimize.CommonsChunkPlugin({
            name: "common",
            chunks: ["application", "infrastructure"],
            minChunks: 2
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            'ko': 'knockout',
            'Raven': 'raven-js',
            'Mustache': 'mustache',
            'application': 'application'
        })
    ],

    module: {
        loaders: [
            { test: /\.json&/, loader: "json-loader" },
            { test: /jquery\.js$/, loader: "exports?window[\'jQuery\']" },
            { test: componentsRegExp, loader: "bundle" },
            { test: /site_effects\.js$/, loader: "script" }
        ]
    },

    resolve: {
        root: path.join(__dirname, "www/js"),
        modulesDirectories: [],
        extensions: ['', '.js', '.json'], // todo переписать костыль для componentMap с аякса на рекуаир, может сработать благодаря добавленному расширению
        alias: {

            /**
             * Core section
             * This section can be used in another project
             * */
            router: 					'core/router',
            application: 				'core/application',
            mediator: 					'core/mediator',
            Collection:                 'core/Collection',
            _: 							'core/_',
            Model: 						'core/Model',
            View: 						'core/View',
            ajaxAdapter: 				'core/ajaxAdapter',
            infrastructure:             'core/infrastructure',
            componentsMap:              'core/componentsMap.json',
            ruLanguage:              	'i18n/language/ru.json',

            /**
             * Library section
             * This application base section
             * */
            // @ifndef DEBUG
            'knockout':                			'lib/knockout/knockout.debug',
            // @endif
            // @ifdef DEBUG
            //'knockout':                			'lib/knockout/knockout.debug',
            // @endif
            jquery:        'lib/jquery/jquery',
            video:         'lib/video.js/video',
            jssip: 		   'lib/jssip/jssip',
            Jcrop:         'lib/Jcrop/jquery.Jcrop-modification',
            FileAPI:       'lib/FileAPI/FileAPI',
            page:          'lib/page/page', //page: for Support in IE8+ install html5-history-api
            favicon: 		'lib/favicon/favicon',
            mustache: 		'lib/mustache/mustache',
            raven: 			'lib/raven-js/raven',
            modernizr: 		'lib/_custom_build/modernizr/modernizr',
            require: 		'lib/requirejs/require',
            requirejs: 		'lib/requirejs/require',

            /**
             * Plugins section
             *
             * */
            'jquery.formstyler':      	'lib/jquery.formstyler/jquery.formstyler',
            'jquery.touchswipe':      	'lib/jquery-touchswipe/jquery.touchswipe-fork',
            'jquery.maskedinput':     	'lib/jquery.maskedinput/jquery.maskedinput',
            'jquery.fileapi':         	'lib/jquery.fileapi/jquery.fileapi',
            'jquery.cookie':            'lib/jquery.cookie/jquery.cookie',
            'FileAPI.html5':          	'lib/FileAPI/FileAPI.html5',
            'knockout.keybind':       	'plugin/knockout/knockout.keybind',
            'knockout.animatetext':   	'plugin/knockout/knockout.animatetext',
            'knockout.mapping':       	'plugin/knockout/knockout.mapping',
            'knockout.validation':    	'plugin/knockout/knockout.validation',
            'knockout.reactor':       	'plugin/knockout/knockout.reactor.modification',
            'knockout-switch-case':   	'lib/knockout-switch-case/knockout-switch-case',
            mousewheel: 				'lib/jquery-mousewheel/jquery.mousewheel',
            'jquery-ui': 				'lib/_custom_build/jquery-ui/jquery-ui',

            /**
             * Application components section
             *
             * */
            eventSourceAdapter: 		'transport/eventSourceAdapter',
            cookieStoreManager:         'storage/cookieStoreManager',
            show_tooltip: 				'plugin/jquery/jquery.show_tooltip',
            site_effects: 				'script/site_effects',
            user_actions: 				'daemons/user_actions',
            renderTabsBindingHandlers: 	'plugin/knockout/renderTabsBindingHandlers',
            timeline: 					'script/timeline',
            webinarTimeline: 			'script/webinarTimeline',
            ClockDaemon: 				'daemons/ClockDaemon',
            calendar: 					'script/calendar',


            LanguagesModel: 			'viewModel/LanguagesModel',
            PlayerModel: 				'viewModel/PlayerModel',
            SearchModel: 				'viewModel/SearchModel',
            StreamerControlModel: 		'viewModel/StreamerControlModel',
            uiEventModel: 				'viewModel/uiEventModel',
            TimeModel:                  'viewModel/TimeModel',
            LoginViewModel: 			'viewModel/LoginViewModel',

            FileViewModel: 				'viewModel/FileViewModel',

            DialogModel:                'model/DialogModel',
            SettingsModel:				'model/SettingsModel',
            MessageModel: 			    'model/MessageModel',
            UserModel: 					'model/UserModel',
            NewsModel:                  'model/NewsModel',
            WebinarModel: 				'model/WebinarModel',
            ParticipantModel: 			'model/ParticipantModel',
            FileModel: 					'model/FileModel',
            CatalogModel: 				'model/CatalogModel',
            FolderModel: 				'model/FolderModel',
            CountersModel: 				'model/CountersModel',

            DialogsCollection: 	        'collections/DialogsCollection',
            WebinarsCollection: 	    'collections/WebinarsCollection',
            MessagesCollection: 	    'collections/MessagesCollection',
            NewsCollection: 			'collections/NewsCollection',
            UsersCollection: 			'collections/UsersCollection',
            FilesCollection:			'collections/FilesCollection',
            FilesCollection2: 			'collections/FilesCollection2',

            ParticipantsCollection:		'collections/ParticipantsCollection',


            /**
             * package for catalog
             *
             * */

            "catalog-tree": 					'components/pages/profile-page/tab-library/catalog-tree/catalog-tree',
            DragAndDropModel: 					'components/pages/profile-page/tab-library/catalog-tree/viewModel/mixin/DragAndDropModel',
            ItemCatalogViewModel: 				'components/pages/profile-page/tab-library/catalog-tree/viewModel/mixin/ItemCatalogViewModel',
            FolderTreeViewModel: 				'components/pages/profile-page/tab-library/catalog-tree/viewModel/FolderTreeViewModel',
            FileTreeViewModel: 					'components/pages/profile-page/tab-library/catalog-tree/viewModel/FileTreeViewModel',
            CatalogViewModel: 					'viewModel/CatalogViewModel',

            /**
             * package for pdf-module
             *
             * */

            'pdf':                 'lib/pdf.js/build/pdf',
            'pdf-l10n':            'lib/pdf.js/web/l10n',
            'pdf-pdf.worker':      'lib/pdf.js/build/pdf.worker',
            'pdf-viewer':          'lib/pdf.js/web/viewer',
            'pdf-compatibility':   'lib/pdf.js/web/compatibility',
            'pdf-debugger':        'lib/pdf.js/web/debugger',

            /**
             * config
             *
             * */
            ravenConfig: 'config/ravenConfig',
            knockoutConfig: 'config/knockoutConfig',
            ES6: 'config/javascript/ES6',
            ES5: 'config/javascript/ES5',

            'text':                     	'plugin/require/require-text',
            'json':                     	'plugin/require/require-json',


            adapterJanus: 	'lib/janus/adapter.js',
            janus: 			'lib/janus/janus.js',
            "md5.min": 		'lib/janus/md5.min.js'
        }
    }
};