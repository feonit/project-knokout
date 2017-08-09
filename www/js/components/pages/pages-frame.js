define([
    '_',
    'knockout',
    'application',
    'text!components/pages/pages-frame.html',
    'View'
], function (
    _,
    ko,
    application,
    template,
    View
) {

    window.savedTarget = null; // костыль

    function checkVisibiliy(target) {
        if ($(target).scrollTop() > 100) {
            $(".go_topbtn").animate({ opacity: "show" }, 300);
        } else {
            $(".go_topbtn").animate({ opacity: "hide" }, 300);
        }
    }

    function hideButton(){
        $(".go_topbtn").animate({ opacity: "hide" }, 300);
    }

    function checkCenter() {
        var mainWidth = $(".middle_main_content").outerWidth();
        var childWidh = $(".scroll_catcher").outerWidth();
        var scrollPadding = mainWidth - childWidh;

        $(".scroll_catcher").css({"padding-left": scrollPadding});
    }


    var PagesFrameComponent = _.defineSubclass(View, function PagesFrameComponent(params) {
        View.apply(this, arguments);

        this.authorized = ko.observable(params.authorized);

        this.currentPageTemplateName = ko.observable();

        // some data for page
        this.params = ko.observable();

        var INTERVAL_LAZY_UPLOADING = 1000;
        var processScrolling = false;

        window.API_pages_frame = this;

        this.scrolling = function(data, event){
            var target = event.target;

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

        var that = this;

        /**
         * Enum
         * */

        this.API = {
            trigger: {

            },
            commands: {
                change: function(pageName, params){
                    that.params(params);
                    that.currentPageTemplateName(pageName);
                },
                scrollDown: function(){
                    var $wrapper = $('.middle_main_content');
                    $wrapper.animate({"scrollTop": $wrapper[0].scrollHeight }, 500);
                }
            }
        };

        this.afterRender();
    } , {

        afterRender: function(){
            this.addCommand('change:page', this.API.commands.change, this);
            this.addCommand('scroll:down', this.API.commands.scrollDown, this);
            checkCenter(); // TODO
        },

        dispose: function() {
            this.removeCommand('change:page', this.API.commands.change);
            this.removeCommand('scroll:down', this.API.commands.scrollDown);
            hideButton();
        }
    });

    return { viewModel: PagesFrameComponent, template: template }
});