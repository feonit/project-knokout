define([
    '_',
    'knockout',
    'application',
    'UsersCollection',
    'View',
    'text!components/pages/webinar-start-page/tab-invite/tab-invite-participants/invite-participants-colleagues-list/invite-participants-colleagues-list.html'], function(
    _,
    ko,
    application,
    UsersCollection,
    View,
    template
){

    var Component = _.defineSubclass(View,
        /**
         * @param {object} params
         * */
        function Component(params) {

            View.apply(this, arguments);

            this._route = params.route;

            this.usersCollection = ko.observable();

            var that = this;

            this.API = {
                commands: {
                    onCommandSearch : function(searchString){
                        that.usersCollection().fetch({
                            searchString: searchString
                        });
                    },
                    onCommandReset: function(){

                    }
                }
            };

            this.afterRender();
        } , {

            afterRender: function(){
                this.addCommand('command_search', this.API.commands.onCommandSearch, this);
                this.addCommand('command_reset', this.API.commands.onCommandReset, this);

                var colleagues = new UsersCollection(
                    { id: this._route().userId }
                );
                this.usersCollection(colleagues);
                this.usersCollection().lazyFetch();

                application.root().colleagues(colleagues);// todo remove

            },
            /**
             * ko auto dispose
             * */
            dispose : function(){
                this.removeCommand('command_search', this.API.commands.onCommandSearch);
                this.removeCommand('command_reset', this.API.commands.onCommandReset);
            }
        }
    );

    return { viewModel: Component, template: template }
});