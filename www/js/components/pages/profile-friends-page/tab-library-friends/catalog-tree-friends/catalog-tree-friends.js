define([
    '_',
    'application',
    'knockout',
    'CatalogViewModel',
    'text!components/pages/profile-friends-page/tab-library-friends/catalog-tree-friends/catalog-tree-friends.html'
], function(
    _,
    application,
    ko,
    CatalogViewModel,
    template
){
    var FriendsCatalogViewModel = _.defineSubclass(CatalogViewModel,
        /**
         * A constructor for Catalog Tree view
         * @class FriendsCatalogViewModel
         * @constructs FriendsCatalogViewModel
         * @extends CatalogViewModel
         * @param {Object} params — Optional Object with extra parameters (see below)
         * */
        function FriendsCatalogViewModel(params){
            CatalogViewModel.apply(this, arguments);

            /**
             * Получить идентификатор владелеца каталога
             * @arg
             * @function
             * @return {number}
             * */
            this.userID = params.route().userId;

            API_VirtualFileSystem = this;

            application.root().catalogViewModel(this); //todo

            var that = this;

            this.readRequest({
                callback: function(){
                    that.rootFolder().open();
                }
            });

            this.noItems = ko.computed(function(){
                    var totalFiles = this.countOfAllFiles();
                    return totalFiles === 0;
            }, this);
        },
        /** @lends FriendsCatalogViewModel.prototype */
        {
            dispose: function(){
            }
        },
        /** @lends FriendsCatalogViewModel */
        {

        }
    );

    return { viewModel: FriendsCatalogViewModel, template: template }
});