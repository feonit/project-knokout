define([
    '_',
    'knockout',
    'application',
    'UsersCollection',
    'View',
    'text!components/pages/profile-page/tab-colleagues/colleagues-list/colleagues-list.html'
], function(
    _,
    ko,
    application,
    UsersCollection,
    View,
    template
){

    var ColleaguesViewModel = _.defineSubclass(View,
        /**
         * @param {object} params
         * */
        function ColleaguesViewModel(params) {

            View.apply(this, arguments);

            var colleagues = new UsersCollection(
                { id: application.root().currentUser().id() }
            );

            this.usersCollection = ko.observable(colleagues);

            application.root().colleagues(colleagues);

            this.usersCollection().lazyFetch();

            var that = this;

            this.API = {
                commands: {
                    onCommandSearch : function(searchString){
                        that.usersCollection().fetch({
                            searchString: searchString
                        });
                    }
                }
            };

            this.addCommand('command_search', this.API.commands.onCommandSearch, this);

        } , {
            /**
             * ko auto dispose
             * */
            dispose : function(){
                this.removeCommand('command_search', this.API.commands.onCommandSearch);
            }
        }
    );

    return { viewModel: ColleaguesViewModel, template: template }
});