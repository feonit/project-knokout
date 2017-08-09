define([
    'knockout',
    'text!components/'
], function (
    ko,
    template
) {

    function Component(params) {

    }

    Component.prototype = {
        afterTemplateInsert: function(){},

        beforeRender: function(){},

        afterRender: function(){

        },

        dispose : function() {

        }
    };

    return { viewModel: Component, template: template }
});