define([
    '_',
    'knockout',
    'View',
    'text!components/folder-item/folder-item.html'
], function(
    _,
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