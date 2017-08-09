define([
    '_',
    'mediator'
], function(
    _,
    mediator
){

    function View(attributes){

        if (!_.isObject(attributes) || !_.isString(attributes.componentName)){
            throw Error('lost "componentName" param for that view')
        }

        this.componentName = attributes.componentName;
    }

    /**
     * Инкапсуляция медиатора
     * */
    View.prototype = {

        constructor: View,

        /**
         * Метод позволяет поставить обработчик на команду вызываемую внешним кодом,
         * @param {string} eventName — Имя события
         * @param {function} handler — Обработчик события
         * @param {object} context — Контекст выполнения обработчика события
         * */
        addCommand: function(eventName, handler, context){
            mediator.on(this.componentName, eventName, handler, context)
        },
        /**
         * Метод позволяет удалить команду
         * @param {string} eventName — Имя события
         * @param {function} handler — Обработчик события
         * */
        removeCommand: function(eventName, handler){
            mediator.off(this.componentName, eventName, handler);
        },
        /**
         * Метод позволяет вызвать комманду
         * @param {string} targetName — Имя объекта
         * @param {string} eventName — Имя команды
         * */
        callCommand: function(targetName, eventName){
            var args = Array.prototype.slice.call( arguments );
            targetName = args.shift();
            eventName = args.shift();
            var attr = [targetName, eventName];

            mediator.trigger.apply(mediator, attr.concat(args) );
        },
        /**
         * Метод позволяет слушать другие объекты
         * @param {string} targetName — Имя объекта
         * @param {string} eventName — Имя события
         * @param {function} handler — Обработчик события
         * @param {object} context — Контекст выполнения обработчика события
         * */
        listenTo: function(targetName, eventName, handler, context){
            mediator.on(targetName, eventName, handler, context);
        },
        /**
         * Метод позволяет отменить прослушку других объектов
         * @param {string} targetName — Имя объекта
         * @param {string} eventName — Имя события
         * @param {function} handler — Обработчик события
         * */
        stopListening: function(targetName, eventName, handler){
            mediator.off(targetName, eventName, handler);
        },

        /**
         * Метод публикует событие
         * @param {string} eventName — Имя события
         * */
        trigger: function(eventName){
            var args = Array.prototype.slice.call( arguments );
            var attr = [this.componentName, args.shift()];

            mediator.trigger.apply(mediator, attr.concat(args));
        },

        detach: function(){
            mediator.detach.call(mediator, this.componentName);
        }
    };

    return View;

});