require.config({
	waitSeconds: 1000,
	catchError: false,
	locale: 'ru-ru',
	baseUrl: '/js',
	paths: {

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
	},

	shim: {
		'jquery': { exports: '$'},
		'knockout': { exports: 'ko'},
		'knockout.mapping':{ deps: ['knockout'], exports: 'ko.mapping'},
		'knockout.reactor':{ deps: ['knockout'] },
		'knockout-switch-case': { deps: ['knockout'] },
		'FileAPI.html5': { deps: ['FileAPI'] },
		'raven-js': { exports: 'Raven' },
		'mustache':{ exports: 'Mustache' },
		'json': { deps: ['text'] },
	}
});

require([
	'infrastructure',
	'text',
	'json',
	'application',
], function(){
	//start
});