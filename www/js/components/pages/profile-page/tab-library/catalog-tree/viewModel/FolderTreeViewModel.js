/**
 * Created by Feonit on 27.07.15.
 */

define([
    '_',
    'knockout',
    'FolderModel',
    'ItemCatalogViewModel',
    'DragAndDropModel'
], function(
    _,
    ko,
    FolderModel,
    ItemCatalogViewModel,
    DragAndDropModel
){

    "use strict";

    var FolderTreeViewModel = _.defineSubclass(FolderModel,

        /**
         * A class for view of folder at tree
         * @class FolderViewModel
         * @constructs FolderViewModel
         * @param {Object} options — Optional Object with extra parameters (see below)
         * @extends FolderModel
         * @extends DragAndDropModel
         * @extends ItemCatalogViewModel
         * */
        function FolderViewModel(options){
            this.__super = ItemCatalogViewModel.prototype;

            var parent = options.data.parent;

            delete options.data.parent; // не смешивать данные с объектами для mapping

            FolderModel.call(this, options.data, options.userID);
            DragAndDropModel.apply(this);
            ItemCatalogViewModel.apply(this);

            var MAX_NESTING_LEVEL = 10;

            /**
             * @public
             * @param {Function}
             * @return {Boolean}
             * */
            this.isOpened = ko.observable(false);
            /**
             * @public
             * @param {Function}
             * @return {Boolean}
             * */
            this.renamed = ko.observable(false);
            /**
             * Папка готова принять элемент
             * */
            this.isTaking = ko.observable(false);
            /**
             * Папка приняла элемент
             * */
            this.isTaken = ko.observable(false);
            /**
             * Пустая ли папка на самом деле
             * */
            this.isEmptyRealy = ko.computed(function(){
                var isEmptyRealy;

                if (!this.files().isFetched()){
                    // сначало основываемся на том что говорит сервер
                    isEmptyRealy = this.isEmpty();
                } else {
                    // потом по состоянию
                    isEmptyRealy = !this.getTotalItemsCount();
                }
                return isEmptyRealy;
            }, this);
            /**
             * @public
             * @param {Function}
             * @return {?FolderViewModel}
             * */
            this.parent = ko.observable(parent);
            /**
             * @public
             * @param {Number}
             * */
            this.nestingLevel = ko.computed(function(){
                var level = 1;
                function reqursive(folder){
                    var parent = folder.parent();

                    if (parent !== null){
                        level += 1;
                        reqursive(parent);
                    }
                }
                reqursive(this);
                return level;
            }, this);
            /**
             * @public
             * @param {Function}
             * @return {Boolean}
             * */
            this.isRoot = ko.observable(this.nestingLevel() === 1);
            /**
             * Специальный флаг
             * если папка находится в максимальном уровне вложенности
             * */
            this.isMaxNestingLevel = ko.computed(function(){
                return this.nestingLevel() > MAX_NESTING_LEVEL;
            }, this);

            /**
             * Отключение возможности выборки для элемента
             * */
            this.isDisabledCheckBox = ko.observable(false);

            // except root folder
            if (this.isRoot()){

                this.mayTake = ko.observable(true);

            } else {

                /**
                 * Специальное поведение
                 * если папка выбрана, она не может уже быть приемником, это поведение постоянно (задача - исключить выбранные папки и все дочерние из возможных приемников)
                 * если папка максимального уровня вложенности, то она уже не может быть приемником
                 * */
                this.mayTake = ko.computed(function(){
                    return !this.isSelected() && !this.isMaxNestingLevel();
                }, this);

                this.isSelected(this.parent().isSelected());

                this.deleted.subscribe(function onDelete(value){
                    if (value){
                        this.close();
                        this.isSelected(false);
                    }
                }, this);

                this.isOpenedRenameForm.subscribe(function(value){
                    this.isAllowedDnD(!value);
                }, this);


                if (!this.parent().isRoot()){
                    this.isDisabledCheckBox(this.parent().isSelected() || this.parent().isDisabledCheckBox());
                }

                // set passive state for all items
                // end deactivate selected state
                this.isSelected.subscribe(function(value){
                    var action = function (elem, spec){
                        if (!spec){
                            elem.isDisabledCheckBox(value);
                            elem.isSelected(false);
                        }

                        if (elem.childrens) { // than it is a folder
                            ko.utils.arrayForEach(elem.files().models(), function(item){action(item)});
                            ko.utils.arrayForEach(elem.childrens(), function(item){action(item)});
                        }
                    };
                    action(this, true)
                }, this);
            }

        } ,

        /** @lends FolderViewModel.prototype */ {
            /**
             * По клику на пустую папку
             * */
            onClickAtEmptyFolder: function(model, event){
                event.stopPropagation();
            },
            /**
             * Gets the number of elements in the tree
             * @this FolderViewModel
             * */
            getTotalItemsCount: function(){
                return this.childrens().length + this.files().models().length;
            },
            /**
             * Gets the number of the selected elements in the tree
             * @this FolderViewModel
             * */
            getSelectedItemsCount: function(){
                var count = 0;
                ko.utils.arrayForEach(this.childrens(), function(children){
                    children.isSelected() && count++;
                }, this);

                ko.utils.arrayForEach(this.files().models(), function(file){
                    file.isSelected() && count++;
                }, this);
                return count;
            },
            /**
             * Include all elements of the state as the selected
             * @this FolderViewModel
             * @public
             * */
            selectAll: function(){
                this._setSelectedState(true);
            },
            /**
             * Disable all selected elements
             * @this FolderViewModel
             * @public
             * */
            unselectAll: function(){
                this._setSelectedState(false);
            },
            /**
             * Sets the state selected
             * @this FolderViewModel
             * @param {boolean} boolean - is selected or no
             * @private
             * */
            _setSelectedState: function(boolean){
                ko.utils.arrayForEach(this.childrens(), function(children){
                    children.isSelected(boolean);
                    children._setSelectedState(boolean); // рекурсивно
                }, this);

                ko.utils.arrayForEach(this.files().models(), function(file){
                    file.isSelected(boolean);
                }, this);
            },
            /**
             * Loads the data and opens the folder
             * @this FolderViewModel
             * @param {object} options - options.callback
             * @public
             * */
            open : function(options){
                options = options || {};

                if(!this.files() || !this.files().isFetched()){
                    this.files().fetch({
                        callback: (function(){
                            this.isOpened(true);
                            options.callback && options.callback();
                        }).bind(this)
                    });
                } else {
                    this.isOpened(true);
                    options.callback && options.callback();
                }
            },
            /**
             * Close the folder
             * @this FolderViewModel
             * @public
             * */
            close : function(){
                // don't close root folder
                if (this.isRoot()) return;

                this.isOpened(false);

                this.closeAllChildFolders();
            },

            closeAllChildFolders: function(){
                ko.utils.arrayForEach(this.childrens(), function(children){
                    children.close();
                }, this);
            },
            /**
             * Opens or closes the folder
             * @this FolderViewModel
             * @param {object} model
             * @param {event} event
             * */
            toggleIsOpenedState : function(model, event){
                var switched = !this.isOpened();
                switched ? this.open() : this.close();
                setTimeout(function() {
                    $(".contents_of_folder").removeClass("overflow_blink");
                }, 1000);
                event.stopPropagation();
            },
            onClickRestore: function(model, event){
                event.preventDefault();
                event.stopPropagation();
                this.restore();
            }
        }
    );

    _.lessMix(FolderTreeViewModel.prototype, ItemCatalogViewModel.prototype);
    _.mix(FolderTreeViewModel.prototype, DragAndDropModel.prototype);

    return FolderTreeViewModel;
});