/**
 * Организуется взаимодействие на вкладке Library
 * */

define(['_',
    'knockout',
    'application',
    'View',
    'text!components/pages/profile-page/tab-library/tab-library.html',
    'video'
], function(
    _,
    ko,
    application,
    View,
    template){

    var TabLibraryComponent = _.defineSubclass(View,

        function TabLibraryComponent(params) {

            View.apply(this, arguments);

            var that = this;

            /** @param Поиск */
            this.uiSearchControl = 'controlSearchLibrary';

            /** @param Каталог в виде дерева */
            this.uiCatalogLibrary = 'catalogLibrary';

            /** @param Результат поиска в виде списка файлов */
            this.uiFilesList = 'filesLibrary';

            this.userID = application.root().currentUser().id(); //todo

            /**
             * Enum string values.
             * @enum {string}
             */
            var Enumeration = {
                ONE: "catalog",
                TWO: "files"
            };

            /**
             * переключение между деревом и списком файлов
             * @param {Enumeration} a one of the enumeration values.
             */
            this.displayMode = ko.observable(Enumeration.ONE); // files or catalog

            this.API = {
                handlers: {
                    onEventSearch : function(searchString){
                        that.displayMode('files');

                        setTimeout(function(){
                            that.callCommand( that.uiFilesList, 'command_search', searchString );
                        }, 200);
                    },
                    onEventReset : function(){
                        that.displayMode('catalog');
                    }
                },
                commands: {
                    onResetTab: function(){
                        that.displayMode('');
                        that.displayMode('catalog');
                        that.callCommand(that.uiSearchControl, 'command_reset');
                    }
                }
            };

            this.listenTo(this.uiSearchControl, 'event_search', this.API.handlers.onEventSearch, this);
            this.listenTo(this.uiSearchControl, 'event_reset', this.API.handlers.onEventReset, this);
            this.addCommand('command_reset_to_catalog', this.API.commands.onResetTab, this);

        } , {
            dispose: function(){
                this.stopListening(this.uiSearchControl, 'event_search', this.API.handlers.onEventSearch);
                this.stopListening(this.uiSearchControl, 'event_reset', this.API.handlers.onEventReset);

                this.removeCommand('command_reset_to_catalog', this.API.commands.onResetTab);
            }
        }
    );

    return { viewModel: TabLibraryComponent, template: template }
});