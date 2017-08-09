define([
    '_',
    'knockout',
    'application',
    'text!components/header-bar/header-bar-general/header-bar-general.html',
    'View'
], function (
    _,
    ko,
    application,
    template,
    View
) {

    var HeaderBarComponent = _.defineSubclass(View, function HeaderBarComponent(params) {
        this.route = params.route;

        View.apply(this, arguments);

        this.getCurrentDate = function(){
            return new Date().getDate();
        };

        this.currentPageTemplateName = ko.observable();
        this.newsCountShown = ko.observable(application.root().countersModel().newsCount());
        this.dialogsCountShown = ko.observable(application.root().countersModel().dialogsCount());

        /**
         * Enum
         * */
        this.API = {
            trigger: {

            },
            commands: {

            }
        };

        this.afterRender();
    } , {

        afterRender: function(){
            application.root().countersModel().newsCount.subscribe(function(value){
                this.newsCountShown(value)
            }, this);

            application.root().countersModel().dialogsCount.subscribe(function(value){
                this.dialogsCountShown(value)
            }, this);
        },

        dispose : function() {

        }
    });

    return { viewModel: HeaderBarComponent, template: template }
});