define([
    'knockout',
    'application',
    'ajaxAdapter',
    'raven',
    'text!components/bug-report/bug-report.html',
    'site_effects'
], function (
    ko,
    application,
    ajaxAdapter,
    Raven,
    template
) {

    function BugReportComponent(params) {
        this.route = params.route;
        this.text = ko.observable('');
        this.isVisible = ko.observable( this._isStartWebinarPage(params.route()) );
        this.afterRender();

        params.route.subscribe(function(route){
            this.isVisible(this._isStartWebinarPage(route));
        }, this);
    }

    BugReportComponent.prototype = {
        constructor : BugReportComponent,

        afterRender: function(){
            positionTop();//site_effects todo refactor that please
        },

        dispose : function() {
            // raven stop may be here
        },

        _isStartWebinarPage: function (route){
            return route.page !== 'webinar-start-page'
        },

        sendReport : function () {
            Raven.captureMessage(this.text());
            this.text('');
        },

        onBugButtonClick : function(){
            application.api.popupModule.createPopup({
                templateName : 'popup-bug-report-template',
                context : this
            });
        }
    };

    return { viewModel: BugReportComponent, template: template }
});