/**
 * Created by Feonit on 14.07.15.
 */
define(['knockout', 'ajaxAdapter'], function(ko, ajaxAdapter){

    function FileCollcetions(options){
        options = options || {};

        this.models = ko.observableArray([]);
        this.isFetched = ko.observable(false);
        this.isFetching = ko.observable(false);
        this.parent = ko.observable(options.parent);
        this.ownerId = ko.observable(options.ownerId);

    }

    FileCollcetions.prototype = {
        constructor: FileCollcetions,

        fetch : function(options){

            options = options || {};

            this.isFetching(true);

            var url = '/user/' + this.ownerId() + '/file?folderId=' + this.parent().id();
            var that = this;
            var handler = function (res){
                that.parse(res.result);
                that.isFetched(true);
                that.isFetching(false);
                options.callback && options.callback();
            };
            ajaxAdapter.getRequestRestApi(url, handler);
        },

        parse : function(filesData){
            var files = filesData.data.map(function(fileData){

                return API_VirtualFileSystem.createFile({
                    data : fileData,
                    parent: this.parent()
                });

            }, this);

            this.models(files);
        },

        findByXhr : function (id) {
            for (var i in this.models()) {
                if (this.models()[i].xhr_uid() == id) {
                    return this.models()[i];
                }
            }
            return false;
        },

        findById : function (id) {
            for (var i in this.models()) {
                if (this.models()[i].id() == id) {
                    return this.models()[i];
                }
            }
            return false;
        }
    };

    return FileCollcetions;
});