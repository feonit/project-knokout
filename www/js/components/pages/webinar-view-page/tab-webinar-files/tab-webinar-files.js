define([
    'knockout',
    'text!components/pages/webinar-view-page/tab-webinar-files/tab-webinar-files.html'
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