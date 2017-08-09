define([
    '_',
    'jquery',
    'knockout',
    'application',
    'View',
    'text!components/controls/control-search/control-search.html'
], function(
    _,
    $,
    ko,
    application,
    View,
    template
){

    var ControlSearchView = _.defineSubclass(View,
        /**
         * @param {object} attributes — API
         * @param {string} attributes.placeholder
         * */
        function ControlSearchView(attributes){

            View.apply(this, arguments);

            if ( !attributes || !_.isString(attributes.placeholder) ){
                throw Error('control-search was fail attributes');
            }

            this.placeholder = ko.observable(attributes.placeholder);
            this.isEnabled = ko.observable(true);
            this.initSearch = ko.observable(false);
            this.searchEnable = ko.observable(true);
            this.searchString = ko.observable("").extend({
                validate: {
                    deferredMode: true, // Если TRUE, то отображать ошибки только в случаи вызова чек функции
                    rules: [
                        {
                            type: "required",
                            message: application.translation.fieldIsEmpty
                        }
                    ]
                }
            });

            var that = this;

            this.API = {
                trigger: {
                    event_search: function(str){
                        that.trigger('event_search', str);
                    },
                    event_reset: function(){
                        that.trigger('event_reset');
                    }
                },
                commands: {
                    reset: function(){
                        that.initSearch(false);
                        that.searchString('');
                    }
                }
            };

            this.addCommand('command_reset', this.API.commands.reset, this);

            this.searchString.subscribe(function(value){
                this._onEmpty(value);
            }, this)
        } , {

            _onSearchHandler: function (){
                if (this.searchEnable() == true && this.searchString.check()) {
                    this.initSearch(true);
                    this.API.trigger['event_search'](this.searchString())
                }
            },
            /**
             * handler
             * */
            onEnterKey : function(){
                this._onSearchHandler();
            },
            /**
             * handler
             * */
            onClickSearch : function(){
                this._onSearchHandler();
            },
            /**
             * handler
             * */
            onClickReset : function(){
                this._resetState();
            },

            _onEmpty: function(value){
                if(value === ''){
                    this._resetState();
                }
            },

            _resetState: function(){
                this.initSearch(false);
                this.searchString('');
                this.API.trigger['event_reset']();
            }
        }
    );

    /**
     * Контроллер для компонента
     * */
    var ControlSearchViewComponent = _.defineSubclass(ControlSearchView, function ControlSearchViewComponent(){
        ControlSearchView.apply(this, arguments);
    } , {
        /**
         * ko auto dispose
         * */
        dispose : function(){
            this.removeCommand('command_reset', this.API.commands.reset);
        }
    });

    return { viewModel: ControlSearchViewComponent, template: template }
});