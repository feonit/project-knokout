define([
    '_',
    'knockout',
    'FilesCollection',
    'View',
    'text!components/file-list/file-list.html'
], function(
    _,
    ko,
    FilesCollection,
    View,
    template
){

    var Component = _.defineSubclass(View,
        /**
         * @param {object} params
         * */
        function Component(params) {
            View.apply(this, arguments);

            if (!params || typeof params.route().userId === 'undefined'){
                throw Error('some options was lost');
            }
            this.filesCollection = ko.observable(new FilesCollection(
                { id: params.route().userId }
            ));

            this.componentLoaded = function(){
                //alert('componentLoaded')
            };

            var that = this;

            this.API = {
                commands: {
                    onCommandSearch : function(searchString){
                        that.filesCollection().fetch({
                            searchString: searchString
                        });
                    }
                }
            };

            this.addCommand('command_search', this.API.commands.onCommandSearch, this);

        } , {
            /**
             * ko auto dispose
             * */
            dispose : function(){
                this.detach();
            }
        }
    );

    return { viewModel: Component, template: template }
});