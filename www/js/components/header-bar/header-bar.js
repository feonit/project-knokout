define([
    'knockout',
    'text!components/header-bar/header-bar.html'
], function (
    ko,
    template
) {

    function Component(params) {
        this.route = params.route;
        this.displayViewSpecified = ko.observable(this.route().header);
        this.afterRender();
    }

    Component.prototype = {
        afterRender: function(){
            this.sibscribtion = this.route.subscribe(function(route){
                this.displayViewSpecified(route.header);
            }, this);
        },

        dispose : function() {
            if (this.sibscribtion)
                this.sibscribtion.dispose();
        }
    };

    return { viewModel: Component, template: template }
});