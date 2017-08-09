/**
 * @author Feonit feonitu@yandex.ru
 */
define([
    '_',
    'knockout',
], function(
    _,
    ko
){


    var Model = _.defineSubclass(function(){},
        /**
         * @class Предоставляет общие методы для всех моделей данных
         * @constructs Model
         * @param {Object} attributes - Хеш, содержащий состояние модели
         * @return {Model}
         * */
        function Model(attributes){
            this.id = ko.observable();
            this.setAttributes(attributes);
        },
        /** @lends Model.prototype */
        {
            constructor: Model,
            /**
             * Способ установки начальных значений для атрибутов модели
             * @public
             * @param {Object} attributes - The attributes for an instance
             * */
            setAttributes: function(attributes){
                ko.mapping.fromJS(attributes, {}, this);
            },

            /**
             * Парсит сырой ответ с сервера
             * @abstract
             * @return {boolean}
             * */
            parse : function(){
                throw new Error('must be implemented by subclass!');
            },
            /**
             * Запрос на создание объекта сущности на сервере
             * @abstract
             * @return {XMLHttpRequest}
             * */
            createRequest: function(){
                throw new Error('must be implemented by subclass!');
            },
            /**
             * Обновляет текущие значения атрибутов модели данными с сервера
             * @abstract
             * @return {XMLHttpRequest}
             * */
            readRequest: function(){
                throw new Error('must be implemented by subclass!');
            },
            /**
             * Обновляет состояние объекта сущности на сервере
             * @abstract
             * @return {XMLHttpRequest}
             * */
            updateRequest: function(){
                throw new Error('must be implemented by subclass!');
            },
            /**
             * Удаляет объект сущности на сервере
             * @abstract
             * @return {XMLHttpRequest}
             * */
            deleteRequest: function(){
                throw new Error('must be implemented by subclass!');
            },
            isNew: function(){
                return !this.id();
            }
        }
    );

    return Model;
});