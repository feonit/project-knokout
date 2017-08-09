define([
    '_',
    'knockout',
    'application',
    'UsersCollection',
    'View',
    'text!components/pages/profile-friends-page/tab-colleagues-friends/colleagues-list-friends/colleagues-list-friends.html'
], function(
    _,
    ko,
    application,
    UsersCollection,
    View,
    template
){

    var ColleaguesListComponent = _.defineSubclass(View,

        function ColleaguesListComponent(params) {

            View.apply(this, arguments);

            var colleagues = new UsersCollection(
                { id: params.route().userId }
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

    return { viewModel: ColleaguesListComponent, template: template }
});