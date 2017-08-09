/**
 * Created by Feonit on 23.07.15.
 * @module FileTreeViewModel
 */
define([
    '_',
    'knockout',
    'ajaxAdapter',
    'FileModel',
    'DragAndDropModel',
    'FileViewModel'
], function(
    _,
    ko,
    ajaxAdapter,
    FileModel,
    DragAndDropModel,
    FileViewModel
){


    var FileTreeViewModel = _.defineSubclass(FileViewModel,
        /**
         * A constructor for file view
         * @class FileViewModel
         * @constructs FileViewModel
         * @param {Object} options — Optional Object with extra parameters (see below)
         * @param {Object} options.data — This component's attributes for extend of FileModel
         * @param {Object} options.parent — This link to parent of current folder instance
         * @extends FileModel
         * @extends DragAndDropModel
         * @extends ItemCatalogViewModel
         * */
        function FileTreeViewModel(options){

            options = options || {};
            options.data = options.data || {};
            options.parent = options.parent || {};

            FileViewModel.call(this, options.data);
            DragAndDropModel.apply(this);

            /**
             * The parent for that folder
             * @param {Function}
             * @return {FileViewModel}
             * */
            this.parent = ko.observable(options.parent);

            // from DragAndDropModel
            this.setIsSelectedState(false);

            this.deleted.subscribe(function onDelete(value){
                this.setIsSelectedState(value);
            }, this);

            this.isOpenedRenameForm.subscribe(function(value){
                this.isAllowedDnD(!value);
            }, this);

            /**
             * Отключение возможности выборки для элемента
             * */
            this.isDisabledCheckBox = ko.observable(false);

            // except root folder
            if (!this.parent().isRoot()){
                this.isDisabledCheckBox(this.parent().isSelected() || this.parent().isDisabledCheckBox());
            }

        } , {
            setIsSelectedState: function(value){
                if (this.deleted()){
                    this.isSelected(false);
                } else {
                    this.isSelected(value);
                }
            }
        }
    );

    _.mix(FileTreeViewModel.prototype, DragAndDropModel.prototype);

    return FileTreeViewModel;
});