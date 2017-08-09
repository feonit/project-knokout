define([
    'application',
    'knockout',
    'text!components/pages/webinar-start-page/tab-participants/tab-participants.html'
], function (
    application,
    ko,
    template
) {

    function Component(params) {
        this.afterRender();
    }

    Component.prototype = {
        /**
         * API
         * */
        _fetchParticipantsCollection : function(){
            application.root().uiEvent().event().participantsCollection().fetch({
                setGETParameters: {
                    showAuthor: 1,
                    inviteLevel: 3,
                    showGuests: 1
                }
            });
        },

        afterRender: function(){
            this._fetchParticipantsCollection();
        },

        dispose : function() {

        }
    };

    return { viewModel: Component, template: template }
});