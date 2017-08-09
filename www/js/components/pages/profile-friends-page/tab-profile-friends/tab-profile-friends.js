/**
 * Организуется взаимодействие на вкладке Library
 * */

define([
    '_',
    'knockout',
    'application',
    'View',
    'text!components/pages/profile-friends-page/tab-profile-friends/tab-profile-friends.html'
], function(
    _,
    ko,
    application,
    View,
    template
){

    var Component = _.defineSubclass(View,

        function Component(params) {
            this.alienUser = application.root().alienUser();

            View.apply(this, arguments);

            this.API = {
                handlers: {

                },
                commands: {

                }
            };

            this.currentUser = application.root().currentUser();


        } , {
            dispose: function(){

            }
        }
    );

    return { viewModel: Component, template: template }
});