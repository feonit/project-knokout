define([
    'knockout',
    'text!components/file-item/profile-friends-page-control/profile-friends-page-control.html'
], function (
    ko,
    template
) {

    function Component(params) {
        return params.data;
    }

    Component.prototype = {
        afterRender: function(){

        },

        dispose : function() {

        }
    };

    return { viewModel: Component, template: template }
});