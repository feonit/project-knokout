define([
    'video',
    'jquery',
    '_',
    'knockout',
    'text!components/preview-frame/preview-frame.html',
    'View',
    'FileViewModel',
    'application'
], function (
    video,
    $,
    _,
    ko,
    template,
    View,
    FileViewModel,
    application
) {

    function checkScrollWidth() {
        var getParentW = $(".preview_container").outerWidth();
        var getChildW = $(".prevert_scroll").outerWidth();
        var leftPadding = getParentW - getChildW;
        $(".prevert_scroll").css({"padding-left": leftPadding});
    }

    var PreviewViewComponent = _.defineSubclass(View, function PreviewComponent() {
        View.apply(this, arguments);

        this.id = ko.observable();
        this.fileModel = ko.observable(new FileViewModel);
        this.videoPlayerApi = "";

        var that = this;

        this.API = {
            command: {
                showFile: function(file){
                    that.fileModel(file);
                    that.changeImage();
                },
                showMyFileById: function(id){
                    var fileModel = new FileViewModel();
                    fileModel.fetch({
                        id: id,
                        ownerId: application.root().currentUser().id(),
                        callback: function(){
                            that.fileModel(fileModel);
                            that.changeImage();
                        }
                    })
                }
            }
        };

        this.afterRender();
    } , {

        afterRender: function(){
            this.addCommand('show:file', this.API.command.showFile, this);
            this.addCommand('show:my:file', this.API.command.showMyFileById, this);
        },

        dispose : function() {
            this.removeCommand('show:file', this.API.command.showFile);
            this.removeCommand('show:my:file', this.API.command.showFile);
        },

        close : function() {
            if (this.fileModel().type() == 'VIDEO' || this.fileModel().type() == 'AUDIO') {
                if (this.videoPlayerApi !== ""){
                    this.videoPlayerApi.dispose();
                }
            }
            var that = this;

            // todo css
            function closePreview() {
                $(".preview_container").clearQueue();
                $(".preview_header").animate({opacity: "hide", height: "0px"});
                $(".preview_container").animate({opacity: "hide"}, 500, function() {
                    $(".prevert_scroll").css({"padding-left": 0});
                    $(".preview_main_block").animate({opacity: "hide", left: "100%"}, 200, function(){
                        that.fileModel(undefined);
                    });
                });
            }

            closePreview();

            return true; // for link
        },

        /**
         * @this {PreviewViewComponent}
         * */
        changeImage : function () {
            var model = this;


            // todo css
            function openPreview(callback) {
                $(".preview_main_block").animate({opacity: "show", left: "0"}, 200, function() {
                    $(".preview_header").animate({opacity: "show", height: "58px"}, 300, function() {
                        $(".preview_container").animate({opacity: "show"}, 300);

                        checkScrollWidth();

                        $(window).resize(function() {
                            checkScrollWidth()
                        });

                    });
                });
            }

           openPreview();

            var sources = this.fileModel().previews();

            this.fileModel().url(sources);

            if (this.fileModel().type() === 'VIDEO'){

                var configuration = {
                    "controls": true,
                    "autoplay": false,
                    "preload": "auto",
                    "volume": "0.3"
                };
                /**
                 * @this videoPlayerApi
                 * */
                var onReadyPleerHandler = function (){
                    model.videoPlayerApi = this;
                    model.videoPlayerApi.play();
                };

                $('#video_preview_container').attr('poster', '/images/error_image.png');
                videojs("#video_preview_container", configuration).ready(onReadyPleerHandler);
            }
        },

        hrefToBack: function(){
            return application.router.getLocationWithoutParms();
        }
    });

    return { viewModel: PreviewViewComponent, template: template }
});