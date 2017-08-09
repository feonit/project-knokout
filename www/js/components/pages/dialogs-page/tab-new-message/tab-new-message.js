/**
 * Организуется взаимодействие на вкладке
 * */

define([
    '_',
    'knockout',
    'application',
    'View',
    'UsersCollection',
    'text!components/pages/dialogs-page/tab-new-message/tab-new-message.html'
], function(
    _,
    ko,
    application,
    View,
    UsersCollection,
    template
){

    var Component = _.defineSubclass(View,

        function TabLibraryComponent(params) {
            var that = this;

            /** @param Поиск */
            this.uiSearchControl = 'controlSearchLibrary';

            /** @param Список коллег */
            this.uiColleaguesList = 'colleaguesList';

            View.apply(this, arguments);

            this.colleagues = new UsersCollection( {id: application.root().currentUser().id() });

            application.root().colleagues( this.colleagues);

            this.API = {
                handlers: {
                    onEventSearch : function(searchString){
                        that.colleagues.fetch({
                            searchString: searchString
                        });
                    },

                    onEventReset : function(){
                        that.colleagues.updateLazyFetch();
                    }
                },
                commands: {
                    onResetTab: function(){
                        that.callCommand(that.uiSearchControl, 'command_reset');
                    }
                }
            };

            this.listenTo(this.uiSearchControl, 'event_search', this.API.handlers.onEventSearch, this);
            this.listenTo(this.uiSearchControl, 'event_reset', this.API.handlers.onEventReset, this);

            this.addCommand('command_reset_to_catalog', this.API.commands.onResetTab, this);

            application.$body.eventRegister('colleagueRefresh', function(){
                application.root().colleagues().updateLazyFetch();
            });

            application.mediator.subscribe('page_scrolled_bottom', function (){
                application.root().colleagues().lazyFetch();
            });


        } , {
            dispose: function(){
                this.stopListening(this.uiSearchControl, 'event_search', this.API.handlers.onEventSearch);
                this.stopListening(this.uiSearchControl, 'event_reset', this.API.handlers.onEventReset);

                this.removeCommand('command_reset_to_catalog', this.API.commands.onResetTab);
                application.$body.eventUnRegister('colleagueRefresh');

                application.mediator.unsubscribe('page_scrolled_bottom');

            }
        }
    );

    return { viewModel: Component, template: template }
});