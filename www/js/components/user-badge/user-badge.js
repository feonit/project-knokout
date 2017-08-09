define([
    'knockout',
    'text!components/user-badge/user-badge.html'
], function (
    ko,
    template
) {

    function Component(params) {
        this.user = ko.observable(params.user);

    }

    Component.prototype = {
        isAnAuthorizedUser: function(){
            var is = false;

            try {
                is = (this.user().id() == window.appConfig.auth.user.info.id); // todo getConfig system
            } catch (e) {
                return false;
            }
            return is;
        },

        getHref: function(){
            var href;

            href = this.isAnAuthorizedUser()
                ? '/module/user/profile/edit'                       //todo router method
                : '/module/user/profile/view/' + this.user().id();  //todo router method

            return href;
        },

        afterRender: function(){

        },

        dispose : function() {

        }
    };

    return { viewModel: Component, template: template }
});