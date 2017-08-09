define([
    'knockout',
    'application',
    'text!components/pages/profile-page/tab-library/rename-form/rename-form.html'
], function (
    ko,
    application,
    template)
{

    function Component(params) {

    }

    Component.prototype = {

        constructor : Component,

        afterRender: function(){

        },

        dispose : function() {

        }
    };

    return { viewModel: Component, template: template }
});