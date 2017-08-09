/**
 * Организуется взаимодействие на вкладке Library
 * */

define([
    '_',
    'knockout',
    'application',
    'View',
    'LanguagesModel',
    'text!components/pages/profile-page/tab-settings/tab-settings.html'
], function(
    _,
    ko,
    application,
    View,
    LanguagesModel,
    template
){

    var TabLibraryComponent = _.defineSubclass(View,

        function TabLibraryComponent(params) {
            var that = this;

            View.apply(this, arguments);

            application.root().languages(new LanguagesModel);


            this.userSettings = application.root().userSettings();

            setTimeout(function(){
                $('input[type=text], select').styler(); // todo destroy method
                $('.user_profile_option').trigger('refresh');
            }, 20);


            this.API = {
                handlers: {

                },
                commands: {

                }
            };


        } , {
            dispose: function(){

            }
        }
    );

    return { viewModel: TabLibraryComponent, template: template }
});