/**
 * Организуется взаимодействие на вкладке
 * */

define([
    '_',
    'knockout',
    'application',
    'View',
    'WebinarsCollection',
    'text!components/pages/profile-friends-page/tab-webinars-friends/tab-webinars-friends.html'
], function(
    _,
    ko,
    application,
    View,
    WebinarsCollection,
    template
){

    var Component = _.defineSubclass(View,

        function Component(params) {
            var that = this;

            /** @param Поиск */
            this.uiSearchControl = 'controlSearchWebinars';

            View.apply(this, arguments);

            this.API = {
                handlers: {
                    onEventSearch : function(searchString){
                        that.webinarsCollection.fetch({
                            searchString: searchString
                        });
                    },

                    onEventReset : function(){
                        that.webinarsCollection.updateLazyFetch();
                    }
                },
                commands: {
                    onResetTab: function(){
                        that.webinarsCollection.updateLazyFetch();
                        that.callCommand(that.uiSearchControl, 'command_reset');
                    }
                }
            };

            this.webinarsCollection = new WebinarsCollection({id: params.route().userId });

            application.root().webinarsCollection(this.webinarsCollection); // todo

            this.webinarsCollection.lazyFetch();

            this.listenTo(this.uiSearchControl, 'event_search', this.API.handlers.onEventSearch, this);
            this.listenTo(this.uiSearchControl, 'event_reset', this.API.handlers.onEventReset, this);

            this.addCommand('command:tab:reset', this.API.commands.onResetTab, this);

            application.mediator.subscribe('page_scrolled_bottom', function (){
                application.root().webinarsCollection().lazyFetch();
            });


        } , {
            dispose: function(){
                this.stopListening(this.uiSearchControl, 'event_search', this.API.handlers.onEventSearch);
                this.stopListening(this.uiSearchControl, 'event_reset', this.API.handlers.onEventReset);

                this.removeCommand('command:tab:reset', this.API.commands.onResetTab);
                application.mediator.unsubscribe('page_scrolled_bottom');

            }
        }
    );

    return { viewModel: Component, template: template }
});