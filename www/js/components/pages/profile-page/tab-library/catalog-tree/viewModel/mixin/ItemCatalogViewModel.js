/**
 * Created by Feonit on 24.07.15.
 */
define([
    '_',
    'knockout',
    'FileModel',
    'application'
], function(
    _,
    ko,
    FileModel,
    application
){

    /**
     * This provides methods used for event handling.
     *
     * @mixin
     * */
    function ItemCatalogViewModel(){

        AccessControlView.apply(this);
        RenameControlView.apply(this);
    }

    ItemCatalogViewModel.prototype = {

        constructor: ItemCatalogViewModel,

        /**
         * @public handler
         * @see AccessControlView
         * */
        onClickAccessControl: function(model, event){event.stopPropagation();
            this._openAccessControl(event);
        },

        /**
         * @public handler
         * @see FileModel and FolderModel
         * */
        onClickDelete: function(model, event){
            event.stopPropagation();

            if (this instanceof FileModel){
                this.delete();
            } else {
                this.delete();
            }
        },

        /**
         * @public handler
         * @see RenameControlView
         * */
        onClickShowRenameForm : function (model, event) {
            event.stopPropagation();
            this.openRenameForm();
        },

        /**
         * @public method
         * */
        getAccessClass : function () {
            switch (this.secureLevel()) {
                case "PUBLIC":
                    return 'public_access';
                    break;
                case "SUBSCRIBERS":
                    return 'colleagues_access';
                    break;
                case "OWNER":
                    return 'owner_access';
                    break;
            }
        }
    };

    function RenameControlView(){
        this.isOpenedRenameForm = ko.observable(false);
        this.renamed = ko.observable(false);
        /** validation */
        this.newTitle = ko.observable("").extend({
            validate: {
                rules: [
                    {
                        type: "required",
                        message: application.translation.fieldIsEmpty
                    }
                ]
            }
        });
    }

    RenameControlView.prototype = {
        /**
         * @public method
         * */
        openRenameForm: function(){
            this.renamed(true);
            this.newTitle(this.title());
            this.isOpenedRenameForm(true);
        },

        resetRenameForm: function(){
            this.renamed(false);
            this.newTitle(this.title());
        },

        closeRenameForm: function(){
            this.isOpenedRenameForm(false);
        },

        /**
         * @public handler for RenameForm
         * */
        onClickResetRenameForm : function (model, event) {
            event.stopPropagation();
            this.resetRenameForm();
            this.closeRenameForm()
        },

        onEnterKey: function(model){
            this._saveTitle();
        },

        onClickTextField: function(model, event){
            event.stopPropagation();
        },

        onClickSaveTitle : function (model, event) {
            event.stopPropagation();
            this._saveTitle();
        },

        onblur: function(model, event){
            //event.stopPropagation();
            //this.resetRenameForm(); // todo onblur перебивает почему то onClickSaveTitle
        },

        _saveTitle: function(){
            var that = this;

            if (this instanceof FileModel){
                var $xhr = this.saveNewTitle();

                $xhr.always(function(data){
                    if (data.status == 'success') {
                        that.renamed(false);
                        that.title(that.newTitle());
                        that.closeRenameForm()
                    } else {
                        $(that.newTitle.domElement()).showError(data.fields.title);
                    }
                });

            } else {
                var $xhr = this.saveNewTitle();

                that.renamed(false);
                that.title(that.newTitle());
                that.closeRenameForm()
            }
        }
    };

    function AccessControlView(){
        this.accessIsOpened = ko.observable(false);
    }

    AccessControlView.prototype = {

        constructor: AccessControlView,

        /**
         * @public handler for AccessControll
         * */
        onClickAccessOwner: function(model, event){
            if (this.accessIsOpened()){
                this.setAccessOwner();
            } else {
                this.accessIsOpened(true);
                event.stopPropagation();
            }
        },

        /**
         * @public handler for AccessControll
         * */
        onClickAccessSubscribers: function(model, event){
            if (this.accessIsOpened()){
                this.setAccessSubscribers();
            } else {
                this.accessIsOpened(true);
                event.stopPropagation();
            }
        },

        /**
         * @public handler for AccessControll
         * */
        onClickAccessPublic: function(model, event){
            if (this.accessIsOpened()){
                this.setAccessPublic();
            } else {
                this.accessIsOpened(true);
                event.stopPropagation();
            }
        },

        setAccessOwner: function(){
            var xhr = this.changeAccess('OWNER');
            xhr.done(this._onChangeAcceessPropDone.bind(this));
            return xhr;
        },

        setAccessPublic: function(){
            var xhr = this.changeAccess('PUBLIC');
            xhr.done(this._onChangeAcceessPropDone.bind(this));
            return xhr;
        },

        setAccessSubscribers: function(){
            var xhr = this.changeAccess('SUBSCRIBERS');
            xhr.done(this._onChangeAcceessPropDone.bind(this));
            return xhr;
        },

        _onChangeAcceessPropDone: function(){
            this._closeAccessSelectControl();
            this._syncParentsItemsStateAccess();
            this._syncChildrensItemsStateAccess();
        },

        _syncParentsItemsStateAccess: function(){
            var currentState = this.secureLevel();

            function reqursive(item){
                var isRoot = item.isRoot && item.isRoot();
                if (isRoot) return;

                var parentState = item.parent().secureLevel();

                // принцип не уменьшения прав родительской папки
                switch (currentState) {
                    case 'OWNER':
                        break;
                    case 'SUBSCRIBERS':
                        if (parentState !== 'PUBLIC'){
                            item.parent().secureLevel('SUBSCRIBERS');
                            reqursive(item.parent());
                        }
                        break;
                    case 'PUBLIC':
                        if (parentState !== 'PUBLIC'){
                            item.parent().secureLevel('PUBLIC');
                            reqursive(item.parent());
                        }
                        break;
                }
            }

            reqursive(this);
        },

        // принцип синхронизации дочерних элементов с родительской папкой
        _syncChildrensItemsStateAccess: function(){
            var currentState = this.secureLevel();
            var isFolder = !!this.isRoot;

            if (!isFolder) return;

            function reqursive(folder, state){
                folder.files().models().forEach(function(file){
                    file.secureLevel(state);
                }, this);
                folder.childrens().forEach(function(folder){
                    folder.secureLevel(state);
                    reqursive(folder, currentState);
                }, this);
            }

            reqursive(this, currentState);
        },

        // TODO перезатер зачем?
        stopPropagation: function(model, event){
            event.stopPropagation();
        },

        /**
         * @public handler for AccessControll
         * */
        onMouseleaveAccessSelectControl: function(model, event){
            //event.stopPropagation();
            //this._closeAccessSelectControl();
        },

        /**
         * @privat
         * */
        _openAccessControl : function(event){
            this.accessIsOpened(true);
        },
        /**
         * @privat
         * */
        _closeAccessSelectControl : function(){
            this.accessIsOpened(false);
        }
    };

    _.mix(ItemCatalogViewModel.prototype, AccessControlView.prototype);
    _.mix(ItemCatalogViewModel.prototype, RenameControlView.prototype);

    return ItemCatalogViewModel;
});