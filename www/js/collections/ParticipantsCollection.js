define([
    'knockout',
    'Collection',
    'ParticipantModel',
    'application',
    'ajaxAdapter'
], function(
    ko,
    Collection,
    ParticipantModel,
    application,
    ajaxAdapter
){

    "use strict";

    /**
     * @class ParticipantsCollection
     *          Participants users of webinar
     * */
    var ParticipantsCollection = Collection.extend({
        /**
         * inviteLevel = {
          INVITED: 0,                            // все заявки
          ACCEPTED: 1,                           // только принятые заявки
          DROPPED: 2,                            // только не принятые заявки
          INVITED_AND_NOT_DROPPED: 3,            // все заявки за исключением отказанных
          INVITED_AND_NOT_ACCEPTED: 4            // все заявки за исключением принятых
        }
         * */
        url: function(){
            return '/webinar/' + this.id + '/subscribers';
        },
        model: ParticipantModel,
        view: ParticipantsCollectionView
    });

    /**
     * @param {Object} options from collection
     * @this {ParticipantsCollectionView}
     * */
    function ParticipantsCollectionView(options){
        this.selectedUsers = ko.computed(function(){
            var participants = options.collection.models(),
                arrIdUsers;

            arrIdUsers = participants.map(function(participant){
                return participant.user().id();
            });

            return arrIdUsers;
        }, this)
    }

    ParticipantsCollectionView.prototype = {
        constructor: ParticipantsCollectionView,

        getParticipantsUsersList : function(){
            var isСolleague,
                id,
                users,
                colleagues = application.root().colleagues().models(),
                authorId = application.root().currentUser().id(),
                isAuthor,
                notСolleagueParticipants;

            users = this.models().map(function(item){
                return item.user();
            });

            notСolleagueParticipants = users.filter(function(user){
                id = user.id();

                isСolleague = colleagues.some(function(colleague){
                    return colleague.id() === id;
                });

                return !isСolleague
            });

            // исключить себя автора
            notСolleagueParticipants = notСolleagueParticipants.filter(function(user){
                isAuthor = user.id() === authorId;

                return !isAuthor;
            });

            return notСolleagueParticipants;
        },
        getParticipantsUsersListAll: function(){
            var users;
            users = this.models().map(function(item){
                return item.user();
            });
            return users;
        },
        /**
         * @param {UserModel} user
         * */
        addUserToParticipants: function(user){
            this.models.push(new ParticipantModel({user: user}));
        },
        /**
         * AJAX
         * @params {number} id of user
         * */
        addUserOnId : function (id) {
            var that = this;
            return ajaxAdapter.requestRestApi('/webinar/' + this.id + '/subscribers', 'POST', {'type': 'invite', 'user_id':id}, function (response) {
                var participant = new ParticipantModel({
                    confirmed: response.result.confirmed,
                    role: response.result.role,
                    status: response.result.confirmed,
                    user: response.result.user
                });
                that.models.push(participant);
            });
        },
        /**
         * @param {UserModel} user
         * */
        removeUserFromParticipants: function(user){
            this.models.remove(function(item){
                return item.user().id() === user.id();
            });
        },
        /**
         * @param {UserModel} user
         * */
        userIsParticipant : function (user) {
            var idTest = user.id();
            return this.selectedUsers().some(function(id){
                return id == idTest;
            });
        },

        /**
         * @param {Object} data for update ParticipantModel
         * */
        updateParticipant : function(data){
            var id = data.user.id;

            this.models().some(function(participant){
                if (id == participant.user().id()){
                    participant.confirmed(data.confirmed);
                    participant.role(data.role);
                    participant.status(data.status);
                    return true;
                } else {
                    return false;
                }
            });
        },

        userListFilter : function (field, searchValue) {
            var items = this.models();
            var filterItems = [];

            for (var index in items) {
                var value = items[index];
                if (value[field]() == searchValue) {
                    filterItems.push(items[index]);
                }
            }
            return filterItems;
        },

        _getKingParticipant: function(){
            return this.models().filter(function(model){
                return model.role() === 'KING';
            });
        },

        _getConfirmedLMSParticipants: function(){
            return this.models().filter(function(model){
                return model.confirmed() === '1' && model.type() === 'LMS' && model.role() !== 'KING';
            });
        },


        getIndexMaximusStart: function(){
            // + king + first max
            return this._getConfirmedLMSParticipants().length + 1;
        },

        _getConfirmedMAXIMUSParticipants: function(){
            return this.models().filter(function(model){
                return model.confirmed() === '1' && model.type() === 'MAXIMUS' && model.role() !== 'KING';
            });
        },

        // чтобы гарантировать порядок
        getParticipantsOrderList: function(){
            return this._getKingParticipant()
                .concat(this._getConfirmedLMSParticipants())
                .concat(this._getConfirmedMAXIMUSParticipants())
        },

        userExist : function (id){
            var participants = this.models();
            for (var i in participants) {
                if (id == participants[i].user().id()) {
                    return participants[i];
                }
            }
            return false;
        },

        userExistAndConfirmedInvite : function (id){
            var participants = this.models();
            for (var i in participants) {
                // а это те кто не подтвердили инвайт, добавим возможность повторного инвайта удалив их из фильтра
                if (id == participants[i].user().id() && participants[i].confirmed() !=='2') {
                    return participants[i];
                }
            }
            return false;
        }
    };

    return ParticipantsCollection;
});