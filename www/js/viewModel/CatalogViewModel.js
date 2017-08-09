/**
 * Created by Feonit on 13.07.15.
 */
define([
    'knockout',
    '_',
    'FolderTreeViewModel',
    'FileTreeViewModel',
    'CatalogModel'
], function(
    ko,
    _,
    FolderViewModel,
    FileViewModel,
    CatalogModel
){

    var CatalogViewModel = _.defineSubclass(CatalogModel,
        /**
         * A constructor for Catalog Tree view
         * @class CatalogViewModel
         * @constructs CatalogViewModel
         * @extends CatalogModel
         * @param {Object} options — Optional Object with extra parameters (see below)
         * */
        function CatalogViewModel(options){
            CatalogModel.apply(this, arguments);

            /**
             * @param {Function} root folder
             * @public
             * */
            this.rootFolder = ko.observable();

            /**
             * @param {Number} count of all files
             * @public
             * */
            this.countOfAllFiles = ko.observable();
        },
        /** @lends CatalogViewModel.prototype */
        {
            /**
             * Method for parse data and create the tree
             * @param {Object} response
             * @public
             * */
            parse : function(response){
                this.rootFolder( this._createRootFolder(response.data) );
                this.countOfAllFiles(response.count);
            },
            /**
             * Способ создания файла с предустановленным поведением
             * @param {object} options — Опции
             * @property {object} options.data — Данные для файла
             * @property {FolderModel} options.parent — Ссылка на родителя
             * @public
             * @return {FileViewModel} Созданный экземпляр файла
             * */
            createFile : function(options){
                if (!options || !options.data || !options.parent){
                    throw TypeError();
                }

                return new FileViewModel(options);
            },
            /**
             * Способ создания папки с предустановленным поведением
             * @param {object} options — Опции
             * @property {object} options.data — Данные для папки
             * @public
             * @return {FolderViewModel} Созданный экземпляр папки
             * */
            createFolder: function(options){
                if (!options || !options.data){
                    throw TypeError();
                }

                options.userID = this.userID;

                return new FolderViewModel(options);
            },
            /**
             * Method for create root folder
             * @param {Object} folderRootData
             * @private
             * */
            _createRootFolder : function(folderRootData){
                folderRootData.parent = null;

                var rootFolder = this.createFolder({
                    data : folderRootData
                });

                this._createFoldersReqursive(rootFolder, folderRootData);

                return rootFolder;
            },
            /**
             * Method for generate the folders of tree based on the received data
             * @param {FolderViewModel} parentFolder
             * @param {Object} parentFolderData
             * @private
             * @return {FolderViewModel}
             * */
            _createFoldersReqursive : function (parentFolder, parentFolderData){

                if (parentFolderData.childrens.length === 0) return parentFolder;

                var collectionChildrens = parentFolderData.childrens.map(function(data){

                    data.parent = parentFolder;
                    data.parent_id = parentFolderData.id;

                    var childFolder = this.createFolder({
                        data : data
                    });

                    this._createFoldersReqursive(childFolder, data);

                    return childFolder;
                }, this);

                parentFolder.childrens(collectionChildrens);

                return parentFolder;
            }
        },
        /** @lends CatalogViewModel */
        {

        }
    );

    return CatalogViewModel;
});