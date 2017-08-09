define([
    'knockout',
    'text!components/header-bar/header-bar-webinar/header-bar-webinar.html'
], function (
    ko,
    template
) {

    function HeaderBarComponent(params) {
        this.route = params.route;

        this.getCurrentDate = function(){
            return new Date().getDate();
        };

        this.afterRender();
    }

    HeaderBarComponent.prototype = {
        constructor : HeaderBarComponent,

        afterRender: function(){

        },

        dispose : function() {

        }

    };

    return { viewModel: HeaderBarComponent, template: template }
});