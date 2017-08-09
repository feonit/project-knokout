/**
 * Организуется взаимодействие на вкладке Library
 * */

define([
    '_',
    'knockout',
    'application',
    'View',
    'text!components/pages/profile-friends-page/tab-colleagues-friends/tab-colleagues-friends.html'
], function(
    _,
    ko,
    application,
    View,
    template
){

    var TabLibraryComponent = _.defineSubclass(View,

        function TabLibraryComponent(params) {
            var that = this;

            /** @param Поиск */
            this.uiSearchControl = 'controlSearchColleagues';

            /** @param Список коллег */
            this.uiColleaguesList = 'colleaguesList';

            View.apply(this, arguments);

            this.API = {
                handlers: {
                    onEventSearch : function(searchString){

                        setTimeout(function(){
                            that.callCommand( that.uiColleaguesList, 'command_search', searchString );
                        }, 200);
                    },

                    onEventReset : function(){
                        application.root().colleagues().updateLazyFetch();
                    }
                },
                commands: {
                    onResetTab: function(){
                        application.root().colleagues().updateLazyFetch();
                        that.callCommand(that.uiSearchControl, 'command_reset');
                    }
                }
            };

            this.userID = params.route().userId;

            this.listenTo(this.uiSearchControl, 'event_search', this.API.handlers.onEventSearch, this);
            this.listenTo(this.uiSearchControl, 'event_reset', this.API.handlers.onEventReset, this);

            this.addCommand('command:tab:reset', this.API.commands.onResetTab, this);

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

                this.removeCommand('command:tab:reset', this.API.commands.onResetTab);
                application.$body.eventUnRegister('colleagueRefresh');

                application.mediator.unsubscribe('page_scrolled_bottom');

            }
        }
    );

    return { viewModel: TabLibraryComponent, template: template }
});