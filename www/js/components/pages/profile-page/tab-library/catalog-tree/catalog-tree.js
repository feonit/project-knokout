define([
        '_',
        'knockout',
        'FilesCollection',
        'FileAPI',
        'ajaxAdapter',
        'application',
        'text!components/pages/profile-page/tab-library/catalog-tree/catalog-tree.html',
        'FolderTreeViewModel',
        'FileTreeViewModel',
        'CatalogViewModel'
    ],
    function(
        _,
        ko,
        FilesCollection,
        FileAPI,
        ajaxAdapter,
        application,
        template,
        FolderViewModel,
        FileViewModel,
        CatalogViewModel
    ){

    window.FileAPI = {
        debug: false   // debug mode, see Console
        , cors: true    // if used CORS, set `true`
        //	, media: false   // if used WebCam, set `true`
        //	, staticPath: '/js/FileAPI/dist/' // path to '*.swf'
        //	, postNameConcat: function (name, idx){
    };

    var errorMessagesList = {
        sizeLimit: application.translation.errorSizeLimit,
        fileExist: application.translation.errorFileExist,
        commonServerError: application.translation.errorCommonServer
    };

    var model,
        MAX_FILE_SIZE = 4 * FileAPI.GB,
        libraryModel;

    function onFileProcessErrorEventSource(event, params) {
        var id = params.file_id,
            msg = params.msg;

        setTimeout(function() {
            if ((model = libraryModel.findById(id)) !== false) {
                model.addError(msg);
            }
        }, 1000);
    }

    function onUpdateFileProgressEventSource(event, params) {
        console.log('Update progress file callback', params.file_id, progress);
        var id = params.file_id,
            progress = params.progress,
            model = libraryModel.findById(id),
            modelExist = (model !== false);

        // если файл был удален, но до сих пор приходят уведомления(из за сетевой задержки в силу природы ajax)
        if (API_VirtualFileSystem.preventProgressEventForFileIds.indexOf(id) > -1){
            return;
        }

        if (modelExist) {
            model.progress(progress);
        } else {

            model = API_VirtualFileSystem.createFile({
                data: {
                    id: id,
                    uploaded: true,
                    process: true,
                    progress: progress
                },
                parent: API_VirtualFileSystem.rootFolder()
            });

            libraryModel.models.unshift(model);
        }

        if (progress === 100) {
            model.uploaded(false);              // конец процесса обработки на сервере
            model.process(false);               // конец процессов
            model.reload();                     // получить урлы
        } else {
            model.uploaded(true);               // продолжение процесса обработки на сервере
            model.process(true);                // продолжение процессов
        }
    }

    function onFileCreateEventSource(data, fileParams){
        if (!fileParams.id){
            throw Error('FIle id not found');
        }

        var model = libraryModel.findById(fileParams.id),
            modelExist = (model !== false);

        if (!modelExist) {
            throw Error('File model not found from EventSource "file_create" ')
        }
        try {
            ko.mapping.fromJS(fileParams, {}, model);

            if (fileParams.progress === 100) {
                model.uploaded(false);          // конец процесса обработки на сервере
                model.process(false);           // конец процессов
                model.reload();                 // получить урлы
            } else {
                model.uploaded(true);           // продолжение процесса обработки на сервере
                model.process(true);            // продолжение процессов
            }
        } catch (e){
            model.addError(errorMessagesList.commonServerError);
            throw Error('[EventSource] Bad parameters for created file: ' + e.message);
        }
    }

    function onFileChangeHandler(event){
        console.log('- 1/3 browse file');

        var files = FileAPI.getFiles(event);
        var fileModel;

        // todo
        // FileAPI.reset(event.currentTarget);

        console.log('- 2/3 start upload file');

        var xhr = FileAPI.upload({
            url: ajaxAdapter.getUrlStaticApi("/user/" + appConfig.auth.user.info.static_api_id + "/file"),

            files: { localFile: files },

            fileupload: function (uploadfile, xhr, options){console.log('- 3/3 upload init callback');
                var onlyName = uploadfile.name.replace(/\.([a-zA-Z]+)$/, '');

                fileModel = API_VirtualFileSystem.createFile({
                    data: {
                        uploaded : false,
                        xhr_uid : xhr.uid,
                        progress : 0,
                        title : onlyName
                    },
                    parent: API_VirtualFileSystem.rootFolder()
                });

                libraryModel.models.unshift(fileModel);

                var sub = fileModel.isCanceled.subscribe(function(value){
                    if (value === true) {
                        xhr.abort();
                        sub.dispose();
                    }
                }, this);

                fileModel.process(true);// старт процессов

                if (uploadfile.size > ( MAX_FILE_SIZE )) {
                    fileModel.addError(errorMessagesList.sizeLimit);
                    xhr.abort();
                    return false;
                }
                return true;
            },

            fileprogress: function (event, file, xhr, options) {
                var pr = Math.floor(event.loaded/event.total * 100),
                    model = libraryModel.findByXhr(xhr.uid);
                model.progress(pr);
                return true;
            },

            filecomplete: function (err, xhr, file, options){
                var model = libraryModel.findByXhr(xhr.uid),
                    modelExist = (model !== false),
                    response = jQuery.parseJSON(xhr.responseText);

                if (!modelExist) {
                    throw Error('File model is not found');
                }

                try {
                    if (err) {
                        throw(err);
                    }

                    if (!response || !response.data){
                        throw Error('Server did not respond');
                    }

                    if (response.error === true && response.message.length > 0){
                        model.addError(response.message.join(' '));
                        return;
                    }

                    if (!response.data.file_id){
                        throw Error('Lost id of file from server');
                    }

                    var fileExist; // проверить есть был ли такой файл уже загружен(есть ли он в коллекции)

                    libraryModel.models().forEach(function(item){
                        if (item.id() === response.data.file_id){
                            fileExist = true;
                        }
                    });

                    if (!fileExist){
                        model.id(response.data.file_id);
                        model.uploaded(true); // следующий процесс обработки сервером
                        model.progress(0);
                        // continue upload
                    } else {
                        model.addError(errorMessagesList.fileExist);
                    }
                } catch (e){
                    model.addError(errorMessagesList.commonServerError);
                    if (xhr && xhr.xhr){
                        xhr.xhr.abort();
                    }
                    model.uploaded(false); // конец процесса обработки на сервере
                    model.process(false); // конец процессов
                    throw e;
                }
            }
        });
    }

    function initialize(model){
        // все загружаемые файлы будут капать в рутовую папку
        libraryModel = model;

        application.$body.eventRegister({
            file_processing_error : onFileProcessErrorEventSource,
            update_file_progress : onUpdateFileProgressEventSource,
            file_create: onFileCreateEventSource
        });

        var target = document.getElementById('browse');

        FileAPI.event.on(target, 'change', onFileChangeHandler);
    }

    function destroy(){
        application.$body.eventUnRegister({
            file_processing_error : onFileProcessErrorEventSource,
            update_file_progress : onUpdateFileProgressEventSource,
            file_create: onFileCreateEventSource
        });

        var target = document.getElementById('browse');

        FileAPI.event.off(target, 'change', onFileChangeHandler);

        libraryModel = undefined;
    }


    var MyCatalogViewModel = _.defineSubclass(CatalogViewModel,
        /**
         * A constructor for Catalog Tree view
         * @class MyCatalogViewModel
         * @constructs MyCatalogViewModel
         * @extends Model
         * @param {Object} params — Optional Object with extra parameters (see below)
         * */
        function MyCatalogViewModel(params){
            CatalogViewModel.apply(this, arguments);

            /**
             * Получить идентификатор владелеца каталога
             * @arg
             * @function
             * @return {number}
             * */
            this.userID = application.root().currentUser().id();

            API_VirtualFileSystem = this;

            this.isEnabledProcessTransfer = ko.observable(false);

            this.preventProgressEventForFileIds = [];

            // поведение
            this.getSelectedTotalItemsLength = ko.pureComputed(function(){
                return this.getSelectedFolders().length + this.getSelectedFiles().length;
            }, this);

            // поведение
            this.getSelectedTotalItems = ko.pureComputed(function(){
                return (this.getSelectedFiles()).concat(this.getSelectedFolders())
            }, this);

            this.onClickEmptyBesideZone = function(){
                this.unselectAll();
            };

            this.noItems = ko.computed(function(){
                if (this.rootFolder()
                    && typeof this.countOfAllFiles() !== "undefined"
                    && this.rootFolder().files() !== "undefined"){
                    var totalFiles = this.countOfAllFiles(),
                        rootFiles = this.rootFolder().files().models().length,
                        folders = this.rootFolder().childrens().length;
                    return totalFiles === 0 && rootFiles === 0 && folders === 0;
                }
                return true;
            }, this);

            application.root().catalogViewModel(this); // todo

            var that = this;

            this.readRequest({
                callback: function(){
                    that.rootFolder().open({
                            callback: function(){
                                initialize(that.rootFolder().files());
                            }
                        }
                    );
                }
            });

            this.dispose = function(){
                destroy();
            };
        },
        /** @lends MyCatalogViewModel.prototype */
        {
            /**
             * super
             * */
            createFile: function(){
                return CatalogViewModel.prototype.createFile.apply(this, arguments);
            },
            /**
             * super
             * */
            createFolder: function(){
                return CatalogViewModel.prototype.createFolder.apply(this, arguments);
            },
            /**
             * Способ создания новой папки с дефолтными аргументами
             * @public
             * @return {FolderViewModel} Созданный экземпляр папки
             * */
            getNewEmptyFolder: function(){
                return new FolderViewModel({
                    data: {
                        id: undefined,
                        title: application.translation.newFolder,
                        ownerName: 'me',
                        parent: this.rootFolder(),
                        deleted: false
                    }
                });
            },
            /**
             * Обработчик события пользовательского интерфейса на создание новой папки в каталоге
             * @public
             * */
            onClickCreateNewFolder: function(){
                var folder = this.getNewEmptyFolder();
                var that = this;

                var xhr = folder.createRequest();

                xhr.done(function(){
                    that.rootFolder().childrens.unshift(folder);
                    folder.openRenameForm();
                });
            },
            /**
             * Получение экземпляров всех выбранных файлов
             * @public
             * @return {Array} Список выбранных файлов
             * */
            getSelectedFiles : function(){
                var root = this.rootFolder(),
                    selected = [];

                if (!root) return selected;

                function reqursive(folder){

                    selected = selected.concat(ko.utils.arrayFilter(folder.files().models(), function(file){
                        return file.isSelected();
                    }));

                    ko.utils.arrayForEach(folder.childrens(), function(children){
                        reqursive(children);
                    });
                }

                reqursive(root);

                return selected;
            },
            /**
             * Получение экземпляров всех выбранных папок
             * @public
             * @return {Array} Список выбранных папок
             * */
            getSelectedFolders : function(){
                var root = this.rootFolder(),
                    selected = [],
                    isSelected;

                if (!root) return selected;

                function requirsive(childrens){
                    ko.utils.arrayForEach(childrens, function (children){

                        isSelected = children.isSelected();

                        if (isSelected){
                            selected.push(children);
                        }

                        if ( children instanceof FolderViewModel){
                            requirsive(children.childrens())
                        }
                    });
                }

                requirsive(root.childrens());

                return selected;
            },
            /**
             * Получение перечьня из двух списков идентификаторов выбранных файлов и папок
             * @public
             * @returns {{files: {FileModel[]}, folders: {FolderModel[]}}}
             * */
            getDataOfMovingItems : function(){
                var files_ids = (this.getSelectedFiles()).map(function(item){
                    return item.id();
                }, this);

                var folder_ids = (this.getSelectedFolders()).map(function(item){
                    return item.id();
                }, this);

                return {
                    files: files_ids,
                    folders: folder_ids
                };
            },
            /**
             * Установка значения свойства isMoved для всех выбранных элементов каталога
             * @public
             * */
            setIsMovedAllSelectedItemsState : function(items, boolean){
                if (typeof boolean !== 'boolean') return false;

                ko.utils.arrayForEach(items, function(composite){ // and others
                    composite.isMoved(boolean);
                }, this);
            },
            /**
             * Сброс активности для всех элементов каталога
             * @public
             * */
            unselectAll: function(){
                this.getSelectedTotalItems().forEach(function(item){
                    item.isSelected(false);
                }, this);
            },
            /**
             * Установка значения свойства isMoving для всех выбранных элементов каталога
             * @public
             * */
            setIsMovingAllSelectedItemsState : function(items, boolean){
                if (typeof boolean !== 'boolean') return false;

                return ko.utils.arrayForEach(items, function(item){
                    item.isMoving(boolean);
                }, this);
            },
            /**
             * Способ перемещения всех выбранных элементов в папку
             * заменяем родительскую папку каждому элементу на указанную и помещаем в нее
             *
             * @param {Object} selected Элементы
             * @param {FolderViewModel} folder Папка назначения
             * */
            moveSelectedToFolder : function(selected, folder){
                if ( !folder instanceof FolderViewModel) return false;

                var folders = [];
                var files = [];
                ko.utils.arrayForEach(selected, function(item){
                    if ( item instanceof FolderViewModel) {
                        item.parent().childrens.remove(item);
                        item.parent(folder);
                        folders.push(item);
                    } else {
                        item.parent().files().models.remove(item);
                        item.parent(folder);
                        files.push(item);
                    }
                }, this);

                folder.childrens.unshiftAll(folders);
                folder.files().models.unshiftAll(files);
            }
        },
        /** @lends MyCatalogViewModel */
        {

        }
    );

    return { viewModel: MyCatalogViewModel, template: template }
});