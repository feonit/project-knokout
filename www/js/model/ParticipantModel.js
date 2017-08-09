define(['knockout', 'UserModel'], function(ko, UserModel){

    function ParticipantModel(data){
        this.subscriber_id = ko.observable();
        this.user = ko.observable(new UserModel);
        this.role = ko.observable('PARTICIPANT');
        this.status = ko.observable('WAIT');
        /**
         * confirmed = {
              INVITED: 0,                            // заявка отправлена
              ACCEPTED: 1,                           // заявка принята
              DROPPED: 2                             // заявка не принята
            }
         * */
        this.confirmed = ko.observable(false);
        this.isEnabledMicrophone = ko.observable(true);
        this.isEnabledSound = ko.observable(true);
        this.onTop = ko.observable(false);

        this.type = ko.observable(); // LMS //MAXIMUS

        if (data) {
            this.setParams(data)
        }
    }

    ParticipantModel.prototype = {
        constructor : ParticipantModel,

        setParams: function(data) {
            ko.mapping.fromJS(data, {}, this);
        }
    };

    return ParticipantModel;
});