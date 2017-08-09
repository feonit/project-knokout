define([
    '_',
    'knockout',
    'application',
    'View',
    'text!components/pages/webinar-start-page/tab-invite/tab-invite-participants/tab-invite-participants.html'
], function(
    _,
    ko,
    application,
    View,
    template
){

    var Component = _.defineSubclass(View,

        function Component(params) {

            View.apply(this, arguments);

            var that = this;

            this.uiSearchControl = 'controlSearchLibrary';

            this.uiParticipants = 'uiParticipants';

            this.API = {
                handlers: {
                    onEventSearch : function(searchString){
                        that.callCommand( that.uiParticipants, 'command_search', searchString );
                    },
                    onEventReset : function(){
                        that.callCommand( that.uiParticipants, 'command_reset' );
                    }
                },
                commands: {
                    onResetTab: function(){
                        that.callCommand( that.uiParticipants, 'command_reset' );
                    }
                }
            };

            this.listenTo(this.uiSearchControl, 'event_search', this.API.handlers.onEventSearch, this);
            this.listenTo(this.uiSearchControl, 'event_reset', this.API.handlers.onEventReset, this);

            this.addCommand('reset:participants:invite', this.API.commands.onResetTab, this);

        } , {
            dispose: function(){
                this.stopListening(this.uiSearchControl, 'event_search', this.API.handlers.onEventSearch);
                this.stopListening(this.uiSearchControl, 'event_reset', this.API.handlers.onEventReset);

                this.removeCommand('reset:participants:invite', this.API.commands.onResetTab);
            }
        }
    );

    return { viewModel: Component, template: template }
});