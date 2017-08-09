define([
    'application',
    'knockout',
    '_',
    'Model',
    'ajaxAdapter'
], function(
    application,
    ko,
    _,
    Model,
    ajaxAdapter
){

    var CatalogModel = _.defineSubclass(Model, function(){

        Model.apply(this, arguments);

        this.loading = ko.observable(true);

    }, {

        /**
         * Method for load data
         * @public method
         * @param options
         * @param options.callback
         * */
        readRequest : function(options){

            var that = this;

            that.loading(true);

            var url = '/user/' + this.userID + '/folder';
            var that = this;
            var handler = function(res){
                that.parse(res.result);
                options.callback();
                that.loading(false);

            };
            ajaxAdapter.getRequestRestApi(url, handler);
        },

        /**
         * save changes
         * */
        updateRequest: function(data, folder, callback){

            var thatID = folder.id();
            var requests = [];

            data.files.forEach(function(id){
                requests.push($.ajax({
                    url : "/restapi/user/" + application.root().currentUser().id() + "/file/" + id,
                    type: 'PUT',
                    data: { fieldUpdateName: 'folder_id', value: thatID}
                }));
            });

            data.folders.forEach(function(id){
                requests.push($.ajax({
                    url : "/restapi/user/" + application.root().currentUser().id() + "/folder/" +id,
                    type: 'PUT',
                    data: { fieldUpdateName: 'parent_id', value: thatID}
                }));
            });

            $.when.apply(null, requests).then(function(){
                callback();
            });
        }

    });

    return CatalogModel;

});