/**
 * Организуется взаимодействие на вкладке Library
 * */

define([
    '_',
    'knockout',
    'application',
    'View',
    'UsersCollection',
    'text!components/pages/webinar-create-page/tab-webinar-create-participants/tab-webinar-create-participants.html'
], function(
    _,
    ko,
    application,
    View,
    UsersCollection,
    template){

    var Component = _.defineSubclass(View,

        function Component(params) {
            var that = this;

            /** @param Поиск */
            this.uiSearchControl = 'controlSearchUsers';

            /** @param Список коллег */
            this.uiColleaguesList = 'colleaguesList';

            View.apply(this, arguments);

            this.API = {
                handlers: {
                    onEventSearch : function(searchString){
                        application.root().colleagues().fetch({
                            searchString: searchString
                        });
                    },

                    onEventReset : function(){
                        application.root().colleagues().updateLazyFetch();
                    }
                },
                commands: {
                    onResetTab: function(){
                        that.callCommand(that.uiSearchControl, 'command_reset');
                    }
                }
            };

            this.usersCollection = new UsersCollection({id: application.root().currentUser().id()});

            application.root().colleagues(this.usersCollection); // todo

            this.usersCollection.lazyFetch();

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

    return { viewModel: Component, template: template }
});