/**
 * Created by Feonit on 23.07.15.
 * @module FileViewModel
 */
define([
    '_',
    'knockout',
    'ajaxAdapter',
    'FileModel',
    'ItemCatalogViewModel',
    'application'
], function(
    _,
    ko,
    ajaxAdapter,
    FileModel,
    ItemCatalogViewModel,
    application
){

    /**
     * @constructor FileViewModel
     * @extends FileModel
     * @mixes ItemCatalogViewModel
     * */
    var FileViewModel = _.defineSubclass(FileModel, function FileViewModel(){

        ItemCatalogViewModel.apply(this);

        this.errorMsg = ko.observable("Произошла ошибка при загрузке файла, возможно, файл уже был загружен");
        this.isCanceled = ko.observable(false);
        this.process = ko.observable(false);
        this.search_type = ko.observable(); // 'user' or 'global'

        /** model */ this.uploaded = ko.observable(false); //todo move to Model
        this.xhr_uid = ko.observable(); //todo move to id

        FileModel.apply(this, arguments);
    }, {
        getDocTypeClass : function () {
            if (this.process() === true) {
                return 'upload_format';
            }

            if (this.hasError()) {
                return 'error_format';
            }

            switch (this.type()) {
                case "DOC":
                    return "document_format";
                    break;
                case "IMAGE":
                    return "graphic_format";
                    break;
                case "AUDIO":
                    return "music_format";
                    break;
                case "VIDEO":
                    return "video_format";
                    break;
                default:
                    return "error_format";
                    break;
            }
        },

        addError : function (msg) {
            this.hasError(true);
            this.errorMsg(msg);
        },

        /**
         * @public method //todo handler?
         * */
        cancel : function () {
            if (this.isCanceled() === true){ // уже был отменен (отмена после отмены)
                return false;
            }

            if (this.isCanceled() === false && this.uploaded() === false){ // отправка файла еще не была отменена и файл еще не был загружен на сервер (отмена до загрузки)
                this.isCanceled(true);
                this._removeFile();
                return false;
            }

            if (this.uploaded() === true){ // если файл уже загружен на сервер (отмена после загрузки)
                var url = ajaxAdapter.getUrlStaticApi("/user/" + appConfig.auth.user.info.static_api_id + "/file/" + this.id());

                var that = this;
                // так как ответ от сервера не проходит через валидатор
                // то скрываем сразу
                that._removeFile();

                // костылик, уведомления еще будут приходить в период отправки запроса
                API_VirtualFileSystem.preventProgressEventForFileIds.push(this.id());

                ajaxAdapter.request(url, "DELETE", {}, function (data, textStatus) {
                    if (data.status == 'success') {
                        that._removeFile();
                    }
                });
            }
        },

        onClickCopyToMyLibrary: function(model, event){
            event.stopPropagation();
            this.copyToMyLibrary();
        },

        onClickDownload :  function () {
            document.location.href = this.originalFile();
        },

        onClickOpenPreview : function (model, event) {
            event.stopPropagation();
            application.mediator.trigger('PREVIEW_FRAME', 'show:file', this)
        },

        _removeFile : function() {
            function clearFileInputField(Id) {
                document.getElementById(Id).innerHTML = document.getElementById(Id).innerHTML;
            }
            clearFileInputField('browse');
            var model = application.root().catalogViewModel().rootFolder().files().findById(this.id());
            if (model){
                application.root().catalogViewModel().rootFolder().files().models.remove(model);
            }
        },

        hrefToFileOwnerUser: function(){
            var ownerId = this.ownerId();
            var myId = parseInt(app.currentUser().id(), 10);
            var isMyFile = myId === ownerId;
            return isMyFile
                ? application.router.generateUrlToMyProfile()
                : application.router.generateUrlToAlianProfile(this.ownerId());
        }

    });

    _.mix(FileViewModel.prototype, ItemCatalogViewModel.prototype);

    return FileViewModel;
});