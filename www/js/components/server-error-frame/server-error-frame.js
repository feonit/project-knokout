define([
    'knockout',
    'application',
    'text!components/server-error-frame/server-error-frame.html'
], function (
    ko,
    application,
    template)
{

    function Component(params) {

    }

    Component.prototype = {

        constructor : Component,

        redirect: function(){
            location.href= '/';
        },

        afterRender: function(){

        },

        dispose : function() {

        }
    };

    return { viewModel: Component, template: template }
});