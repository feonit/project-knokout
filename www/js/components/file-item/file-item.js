define([
    '_',
    'application',
    'knockout',
    'View',
    'text!components/file-item/file-item.html'
], function(
    _,
    application,
    ko,
    View,
    template
){

    var Component = _.defineSubclass(View,

        function Component(params) {
            this.route = params.route;
            _.extend(this, params.data);
            this.afterRender();
        } , {

            afterRender: function(url){

            },

            dispose: function(){

            }
        }
    );

    return { viewModel: Component, template: template }
});