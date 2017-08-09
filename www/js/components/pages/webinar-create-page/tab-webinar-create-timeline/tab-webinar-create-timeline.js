/**
 * Организуется взаимодействие на вкладке Library
 * */

define([
    '_',
    'knockout',
    'View',
    'text!components/pages/webinar-create-page/tab-webinar-create-timeline/tab-webinar-create-timeline.html'
], function(
    _,
    ko,
    View,
    template
){

    var Component = _.defineSubclass(View,

        function Component(params) {

            $(".timeline_time").mask("99:99"); // TODO

        } , {

            dispose: function(){

            }
        }
    );

    return { viewModel: Component, template: template }
});