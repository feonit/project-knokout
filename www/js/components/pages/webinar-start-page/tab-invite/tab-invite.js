define([
    'knockout',
    'text!components/pages/webinar-start-page/tab-invite/tab-invite.html'
], function (
    ko,
    template
) {

    function Component(params) {

    }

    Component.prototype = {
        afterRender: function(){

        },

        dispose : function() {

        }
    };

    return { viewModel: Component, template: template }
});