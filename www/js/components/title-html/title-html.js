define([
    'knockout',
    'application'
], function (
    ko,
    application
) {

    var map = {
        'calendar-page'       : 'calendar',
        'news-page'           : 'news',
        'dialogs-page'        : 'dialogs',
        'webinar-create-page' : 'createNewWebinar',
        'webinar-start-page'  : 'webinars',
        'webinar-view-page'   : 'webinars',
        'login-page'          : 'login',
        'profile-friends-page': 'calendar',
        'profile-page'        : 'otherProfile'
    };

    function Component(params) {
        this.route = params.route;
        this.title = ko.observable();

        this.route.subscribe(function(){
            this.title('LMS · ' +  application.translation[ map[params.route().page] ] );
        }, this)
    }

    return { viewModel: Component, template: '<title data-bind="text: title "></title>' }
});