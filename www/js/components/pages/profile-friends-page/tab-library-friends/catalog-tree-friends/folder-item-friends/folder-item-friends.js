define([
    'knockout',
    'text!components/pages/profile-friends-page/tab-library-friends/catalog-tree-friends/folder-item-friends/folder-item-friends.html'
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