define([
    'knockout',
    'application',
    'text!components/search-frame/search-frame.html'
], function (
    ko,
    application,
    template
) {

    function Component() {

        this.afterRender();

        function checkVisibiliy(target) {
            if ($(target).scrollTop() > 100) {
                $(".go_topbtn").animate({ opacity: "show" }, 300);
            } else {
                $(".go_topbtn").animate({ opacity: "hide" }, 300);
            }
        }

        var processScrolling = false;

        this.scrolling = function(data, event){
            var target = event.target;
            var INTERVAL_LAZY_UPLOADING = 1000;

            checkVisibiliy(target);

            savedTarget = target;

            if (target.scrollTop > (target.scrollHeight - target.offsetHeight - 50)) {
                processScrolling = true;
                application.mediator.publish('page_scrolled_bottom');

                // rule out for doubled event
                setTimeout(function(){
                    processScrolling = false;
                }, INTERVAL_LAZY_UPLOADING); // not more than 500ms

            }

            return true;
        };
    }

    Component.prototype = {
        constructor : Component,

        afterRender: function(){

        },

        dispose : function() {

        }

    };

    return { viewModel: Component, template: template }
});