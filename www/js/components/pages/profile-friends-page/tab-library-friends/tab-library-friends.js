/**
 * Организуется взаимодействие на вкладке
 * */

define(['_',
    'knockout',
    'application',
    'View',
    'text!components/pages/profile-friends-page/tab-library-friends/tab-library-friends.html',
    'video'
], function(
    _,
    ko,
    application,
    View,
    template
){

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

            this.userID = params.route().userId;

            // переключение между деревом и списком файлов
            this.displayMode = ko.observable('catalog'); // files or catalog


            this.API = {
                handlers: {
                    onEventSearch : function(searchString){
                        that.displayMode('files');

                        //setTimeout(function(){
                        //    that.callCommand( that.uiFilesList, 'command_search', searchString );
                        //}, 200);
                        application.mediator.inQueue( that.uiFilesList, 'command_search', searchString ); // этого дочернего элемента еще нет, поэтому в очередь
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

            // 1 todo если хоть один файл на загрузке то блокируем серчь контрол (if process() === true)
            // 2 todo если длинна строки searchString ноль, переключаемся на каталог

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