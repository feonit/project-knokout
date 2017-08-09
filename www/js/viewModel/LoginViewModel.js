define(['knockout'], function(ko){

    "use strict";

    return function loginViewModel() {
        this.loginStep = ko.observable(); // authorized || general || after_activation
    }
});