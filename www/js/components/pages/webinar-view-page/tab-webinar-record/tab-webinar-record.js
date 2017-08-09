define([
    'application',
    'knockout',
    'text!components/pages/webinar-view-page/tab-webinar-record/tab-webinar-record.html',
    'video'
], function (
    application,
    ko,
    template,
    video
) {
    var videoPlayer;

    function Component(params) {

        this.sourceRecord = application.root().eventModel().sourceRecord;
        this.archive_movie_state = application.root().eventModel().archive_movie_state;
        this.beforeRender();

        setTimeout((function(){
            this.afterRender()
        }).bind(this), 20);
    }

    Component.prototype = {
        beforeRender: function(){

        },

        afterRender: function(){
            var isReady = application.root().eventModel().archive_movie_state() == 'READY';
            var configuration = { "controls": true, "autoplay": false, "preload": "auto" };

            application.$document.on('tabHide', '#recordWebinarTab', detach);
            application.$document.on('tabShow', '#recordWebinarTab', attach);

            function detach(){
                if (videoPlayer){
                    videoPlayer.pause();
                }
            }

            function attach(){
                isReady && videojs("#archive", configuration).ready(_onReadyPleerHandler);
            }

            /**
             * @this videoPlayerApi
             * */
            function _onReadyPleerHandler(){
                videoPlayer = this;
            }

            // afterRenderKO
            attach();
        },

        dispose : function() {
            if (videoPlayer){
                videoPlayer.pause();
            }

            if ($('#archive').length){
                videojs("#archive").dispose();
            }

            application.$document.off('tabHide', '#recordWebinarTab');
            application.$document.off('tabShow', '#recordWebinarTab');

        }
    };

    return { viewModel: Component, template: template }
});