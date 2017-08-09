define([
    '_',
    'FileTreeViewModel',
    'application',
    'knockout',
    'text!components/pages/profile-friends-page/tab-library-friends/catalog-tree-friends/file-item-friends/file-item-friends.html'
], function (
    _,
    FileTreeViewModel,
    application,
    ko,
    template
) {
    var Component = _.defineSubclass(FileTreeViewModel, function FileTreeViewModelComponent(params) {

        _.extendOwn(this, params.data);
        this.afterRender();

    } , {

        afterRender: function(){

        },

        dispose : function() {

        }
    });

    return { viewModel: Component, template: template }
});