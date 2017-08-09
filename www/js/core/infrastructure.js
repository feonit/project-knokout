define([
    'jquery',
    'knockout',
    'knockout.mapping',
    'knockout-switch-case',
    'knockout.validation',
    'ES5',
    'ES6',
    'mustache',
    'page',
    'favicon',
    'knockoutConfig',
], function($, ko, mapping){

    window.ko = ko; 	// open ko for knockout.reactor
    ko.mapping = mapping;
    $.event.props.push('dataTransfer');

});