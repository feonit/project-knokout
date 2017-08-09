/**
 * Created by Feonit on 13.07.15.
 */

define([
    'application',
    '_',
    'knockout',
    'FilesCollection2',
    'ajaxAdapter',
    'Model'
], function(
    application,
    _,
    ko,
    FilesCollection,
    ajaxAdapter,
    Model
){

    /**
     * @constructor FolderModel
     * * */
    return _.defineSubclass(Model, function FolderModel(attributes, userID){

            this.id = ko.observable();
            this.ownerId = ko.observable(userID);
            this.isEmpty = ko.observable();
            this.title = ko.observable();
            this.secureLevel = ko.observable('PUBLIC');
            this.deleted = ko.observable(false);

            this.parent_id = ko.observable();
            this.files = ko.observable(new FilesCollection({ parent : this, ownerId: this.ownerId() }));
            this.childrens = ko.observableArray([]);

            Model.apply(this, arguments);
        },

        // Instance methods: copied to prototype

        {
            createRequest: function(){
                var that = this;

                if (!this.isNew()){
                    throw Error('folder always exist');
                }

                return ajaxAdapter.requestRestApi("/user/" + application.root().currentUser().id() + "/folder/", "POST", { title : this.title() },function( res ) {

                    var data = res.result.data;
                    if ( !_.isNumber(data.id)
                        || !_.isString(data.title)
                        || !_.isString(data.secureLevel)
                        || !_.isBoolean(data.deleted)
                        || !_.isNumber(data.parent_id) ) throw Error('some attribute is not found from server response');

                    /** Model.prototype */
                    that.setAttributes(data);

                });
            },

            // update {secureLevel}
            changeAccess : function (accessValue) {
                var that = this;
                return ajaxAdapter.requestRestApi("/user/" + application.root().currentUser().id() + "/folder/" + this.id(), "PUT", { fieldUpdateName : 'access', value : accessValue},function( data ) {
                    that.secureLevel(accessValue);
                });
            },

            // update {deleted}
            delete: function(){
                var that = this;
                return ajaxAdapter.requestRestApi("/user/" + application.root().currentUser().id() + "/folder/" + this.id(), "PUT", { fieldUpdateName : 'delete', value : 1 }, function (data, textStatus) {
                    that.deleted(true);
                });
            },

            // update {deleted}
            restore: function(){
                this.deleted(false);

                return ajaxAdapter.requestRestApi("/user/" + application.root().currentUser().id() + "/folder/" + this.id(), "PUT", { fieldUpdateName : 'delete', value : 0 }, function (data, textStatus) {

                });
            },

            // update {title}
            saveNewTitle: function(){
                return ajaxAdapter.requestRestApi("/user/" + application.root().currentUser().id() + "/folder/" + this.id(), "PUT", { fieldUpdateName: 'title', value: this.newTitle()}, function (data, textStatus) {

                });
            },

            onClickCopyFolderToMyLibrary: function(model, event){
                event.stopImmediatePropagation();
                alert('need copy method')
            }
        }
    );
});