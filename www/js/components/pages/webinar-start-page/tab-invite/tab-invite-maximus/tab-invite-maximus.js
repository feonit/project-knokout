define([
    '_',
    'knockout',
    'application',
    'View',
    'text!components/pages/webinar-start-page/tab-invite/tab-invite-maximus/tab-invite-maximus.html',
    'ajaxAdapter'
], function(
    _,
    ko,
    application,
    View,
    template,
    ajaxAdapter
){

    function MaximusGroupViewModel(attributes){
        this.groupName = ko.observable();

        this.opened = ko.observable(false);

        this.toggleOpenState = function(){
            this.opened(!this.opened());
            setTimeout(function() {
                $(".contents_of_folder").removeClass("overflow_blink");
            }, 1000);
        };

        ko.mapping.fromJS(attributes, mapping, this);

    }

    function MaximusUserViewModel(attributes){
        this.sendInvite = ko.observable();
        this.name = ko.observable();
        this.initials = ko.observable();
        this.phone = ko.observable();
        this.address = ko.observable();
        this.position = ko.observable();
        this.avatar = ko.observable( ajaxAdapter.getStaticUrlBaseUrl('/file/avatar/default/small/default.png') );

        ko.mapping.fromJS(attributes, mapping, this);

        var that = this;

        this.event_id = application.root().uiEvent().event_id;// todo

        this.makeCallRequest = function(){
            return ajaxAdapter.requestRestApi('/webinar/'+that.event_id +'/guests', 'POST', {'number' : this.phone() }, function(data){
                if (data.status == 'success') {
                    that.sendInvite(true);
                    application.root().uiEvent().closeMemberCurtain();
                }
            });
        }
    }

    var mapping = {
        'groups': {
            create: function(options) {
                return new MaximusGroupViewModel(options.data);
            }
        },
        'users': {
            create: function(options) {
                options.data.user.sendInvite = options.data.sendInvite;
                return new MaximusUserViewModel(options.data.user);
            }
        }
    };


    var Component = _.defineSubclass(View,

        function Component(params) {

            View.apply(this, arguments);

            var that = this;

            this.uiSearchControl = 'controlSearchMaximus';

            this.uiParticipants = 'uiParticipants';

            this.API = {
                handlers: {
                    onEventSearch : function(searchString){
                        that.maximusComponent.search(searchString);
                    },
                    onEventReset : function(){
                        that.maximusComponent.resetSearch();
                    }
                },
                commands: {
                    onResetTab: function(){
                        that.maximusComponent.resetSearch();
                    }
                }
            };


            this.maximusComponent = new function MaximusComponent(){
                var self = this;

                this.maximusGroupViewModel = ko.observable();

                this.initSearch = ko.observable(false);

                this.loading = ko.observable(false);

                this.event_id = application.root().uiEvent().event_id;// todo

                this.resetSearch = function(){
                    self.loading(true);
                    self.initSearch(false);
                    // копипаст
                    ajaxAdapter.getRequestRestApi('/webinar/' + self.event_id +'/guests', function(res){
                        self.maximusGroupViewModel(new MaximusGroupViewModel(res.result.data));
                        self.loading(false);
                    });
                };

                this.search = function(searchString){

                    self.loading(true);
                    self.initSearch(true);

                    ajaxAdapter.request('/search/WebinarGuests/'+ self.event_id +'?q=' + searchString, 'GET', {}, function(res){
                        console.log(res);
                        self.maximusGroupViewModel(new MaximusGroupViewModel( res.result.data ));
                        self.loading(false);

                    });
                };
            };

            this.maximusComponent.resetSearch();

            this.listenTo(this.uiSearchControl, 'event_search', this.API.handlers.onEventSearch, this);
            this.listenTo(this.uiSearchControl, 'event_reset', this.API.handlers.onEventReset, this);

            this.addCommand('command:reset:maximus', this.API.commands.onResetTab, this);

        } , {
            dispose: function(){
                this.stopListening(this.uiSearchControl, 'event_search', this.API.handlers.onEventSearch);
                this.stopListening(this.uiSearchControl, 'event_reset', this.API.handlers.onEventReset);

                this.removeCommand('command:reset:maximus', this.API.commands.onResetTab);
            }
        }
    );

    return { viewModel: Component, template: template }
});