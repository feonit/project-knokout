/**
 * Организуется взаимодействие на вкладке Library
 * */

define([
    '_',
    'ajaxAdapter',
    'application',
    'knockout',
    'View',
    'FileAPI',
    'WebinarsCollection', 'text!components/pages/profile-page/tab-profile/tab-profile.html',
    'Jcrop',
    'FileAPI.html5'
], function(
    _,
    ajaxAdapter,
    application,
    ko,
    View,
    FileAPI,
    WebinarsCollection,
    template
){

    var camera,
        jcrop_api,
        crop_cords,
        $cameraUpload,
        $uploadNode,
        $webContainer,
        $btnClose,
        $btnConfirm;

    /**
     * callback Change avatar using mode of local file
     * @param {Event} event
     * */
    function uploadFileModeChange(event) {

        application.api.popupModule.createPopup({
            templateName : 'popup-profile-upload_avatar',

            afterRender: function(){
                var $webContainer = $('.img_webcontainer'),
                    $btnConfirm = $('.js-confirm-upload-popup'),
                    $btnClose = $('.js-close-upload-popup');

                var file = FileAPI.getFiles(event)[0];

                //if (!file.type){
                //    alert("Вам нужно выбрать изображение для загрузки вашего аватара.");
                //    return;
                //}

                FileAPI.getInfo(file, function (err/**String*/, info/**Object*/) {
                    if (err) throw err;

                    if (typeof (info.width) !== "undefined") {
                        $(".inf_step_01, .txt_step_01").hide();
                        $(".inf_step_02, .txt_step_02, .js-container-buttons").add($btnConfirm).show();
                        $btnConfirm.removeClass("disabled_btn");

                        FileAPI.Image(file).resize(600, 450, 'max').get(function (err, img/**Image*/) {

                            event.target.value = ''; // clear path of file for enable double edit

                            $webContainer.html(img);

                            $webContainer.find("canvas").wrap(
                                "<div class='fake_crop'></div>"
                            );

                            $webContainer.find('.fake_crop').Jcrop({
                                boxWidth: 600,
                                boxHeight: 450,
                                minSize: [220, 220],
                                aspectRatio: 1,
                                setSelect: [75, 0, 450, 450],
                                onSelect: _updateCoords,
                                onChange: _updateCoords
                            }, function () {
                                jcrop_api = this;
                            });

                            $btnClose.off('click', _closeFileModeClick)
                                .on('click', _closeFileModeClick);
                            $btnConfirm
                                .off('click', _confirmFileModeClick)
                                .on('click', $.proxy(_confirmFileModeClick, null, img));
                        });
                    } else {
                        alert("Вам нужно выбрать изображение для загрузки вашего аватара.");
                    }
                });
            }
        });
    }

    /**
     * callback Change avatar using mode of camera
     * */
    function uploadCameraModeClick() {

        application.api.popupModule.createPopup({

            templateName : 'popup-profile-upload_avatar',

            afterRender: function(){
                var $that = this,
                    $webContainer = $that.find('.img_webcontainer'),
                    $btnConfirm = $that.find('.js-confirm-upload-popup'),
                    $btnClose = $that.find('.js-close-upload-popup');

                $webContainer.css({
                    'padding-left': '0',
                    'padding-top': '0',
                    width: '600px',
                    height: '450px'
                });

                $(".inf_step_01, .txt_step_01, .take_picture, .btns_controlls, .js-container-buttons").show();
                $(".inf_step_02, .txt_step_02").hide();
                $btnConfirm.removeClass("disabled_btn");
                $btnConfirm.addClass('upl_from_camera' + "disabled_btn");

                // Публикуем камеру
                FileAPI.Camera.publish($webContainer, {start: true}, function (err, cam/**FileAPI.Camera*/) {
                    if (typeof jcrop_api != "undefined") {
                        jcrop_api.destroy();
                    }

                    camera = cam;

                    $webContainer.append(
                        "<div class='fake_crop'></div>"
                    );

                    $webContainer.find('.fake_crop').Jcrop({
                        boxWidth: 600,
                        boxHeight: 450,
                        minSize: [220, 220],
                        aspectRatio: 1,
                        setSelect: [75, 0, 450, 450],
                        onSelect: _updateCoords,
                        onChange: _updateCoords
                    }, function () {
                        jcrop_api = this;
                    });

                    $btnClose
                        .off('click', _closeCameraModeClick)
                        .on('click', _closeCameraModeClick);
                    $btnConfirm
                        .off('click', _confirmCameraModeClick)
                        .on('click', _confirmCameraModeClick);
                });
            }
        });
    }

    /**
     * callback
     * */
    function _closeFileModeClick() {
        $uploadNode.replaceWith($uploadNode = $uploadNode.clone(true));
        jcrop_api.destroy();
    }

    /**
     * callback
     * */
    function _closeCameraModeClick() {
        $uploadNode.replaceWith($uploadNode = $uploadNode.clone(true));
        jcrop_api.destroy();
        if (typeof camera != "undefined") {
            camera.stop();
        }
    }

    /**
     * callback
     * @param {canvas} img
     * */
    function _confirmFileModeClick(img) {
        if (!$(this).hasClass("disabled_btn")) {
            if (typeof (crop_cords) != 'undefined') {
                var original_image = FileAPI.Image(img);
                original_image.crop(crop_cords.x, crop_cords.y, crop_cords.w, crop_cords.h).get(function (error, img) {
                    $(".avatar_preview").html(img);
                    FileAPI.upload({
                        url: ajaxAdapter.getUrlStaticApi('/user/' + appConfig.auth.user.info.static_api_id + '/avatar'),
                        files: { avatarFile : original_image},
                        complete: function (err, xhr){
                            if( !err ){
                                application.root().currentUser().fetch();
                            }
                        }
                    });
                });
                jcrop_api.destroy();
            }
        } else {
            return false;
        }
    }

    /**
     * callback
     * @param event {Event}
     * */
    function _confirmCameraModeClick(event) {
        if (!$(this).hasClass("disabled_btn") && typeof camera != "undefined") {
            var shot = camera.shot(); // Экземпляр FileAPI.Image

            camera.stop();
            if (typeof (crop_cords) != 'undefined') {
                shot.crop(crop_cords.x, crop_cords.y, crop_cords.w, crop_cords.h).get(function (error, img) {
                    $(".avatar_preview").html(img);
                    FileAPI.upload({
                        url: ajaxAdapter.getUrlStaticApi('/user/' + appConfig.auth.user.info.static_api_id + '/avatar'),
                        files: { avatarFile : shot },
                        complete: function (err, xhr){
                            if( !err ){
                                application.root().currentUser().fetch();
                            }
                        }
                    });
                });
            }
            $uploadNode.replaceWith($uploadNode = $uploadNode.clone(true));

            jcrop_api.destroy();
            $(this).removeClass('upl_from_camera');
        }
    }

    /**
     * callback
     * @param {Object} coords
     * */
    function _updateCoords(coords) {
        crop_cords = coords;
    }

    var Component = _.defineSubclass(View,

        function Component(params) {
            var that = this;


            //todo AFTERRENDER
            setTimeout(function(){

                $cameraUpload = $("#camera_upload");
                $uploadNode = $('#local_upload');
                $webContainer = $('.img_webcontainer');
                $btnClose = $('.js-close-upload-popup');
                $btnConfirm = $('.js-confirm-upload-popup');

                $cameraUpload.on('click', uploadCameraModeClick);
                FileAPI.event.on($uploadNode[0], 'change', uploadFileModeChange);

                //$('input[type=text], select').styler(); // todo destroy method

            }, 1000);

            View.apply(this, arguments);

            this.API = {
                handlers: {

                },
                commands: {

                }
            };

            this.currentUser = application.root().currentUser();


        } , {
            dispose: function(){
                if ($cameraUpload && $cameraUpload.length){
                    $cameraUpload.off();
                }
                if ($uploadNode && $uploadNode.length){
                    FileAPI.event.off($uploadNode[0], 'change', uploadFileModeChange);
                }
            }
        }
    );

    return { viewModel: Component, template: template }
});