define([], function(){
    // https://carldanley.com/js-mediator-pattern/
    // + added support for context
    // + added remove all handlers at _topics
    // + on, off, trigger

    return new (( function ( window, undefined ) {

        function Mediator() {
            this._topics = {};

            this._targets = {};
        }

        Mediator.prototype.subscribe = function ( topic, callback, context ) {
            if( ! this._topics.hasOwnProperty( topic ) ) {
                this._topics[ topic ] = [];
            }

            this._topics[ topic ].push( { callback: callback, context: context } );
            return true;
        };

        Mediator.prototype.unsubscribe = function ( topic, callback ) {
            if( ! this._topics.hasOwnProperty( topic ) ) {
                return false;
            }

            if ( ! callback ){
                this._topics[ topic ] = [];
                return true;
            }

            for( var i = 0, len = this._topics[ topic ].length; i < len; i++ ) {
                if( this._topics[ topic ][ i ].callback === callback ) {
                    this._topics[ topic ].splice( i, 1 );
                    return true;
                }
            }

            return false;
        };

        Mediator.prototype.publish = function () {
            var args = Array.prototype.slice.call( arguments );
            var topic = args.shift();

            if( ! this._topics.hasOwnProperty( topic ) ) {
                return false;
            }

            for( var i = 0, len = this._topics[ topic ].length; i < len; i++ ) {
                this._topics[ topic ][ i ].callback.apply( this._topics[ topic ][ i ].context, args );
            }
            return true;
        };

        Mediator.prototype.on = function ( targetName, eventName, callback, context ) {
            if( ! this._targets.hasOwnProperty( targetName ) ) {
                this._targets[ targetName ] = {};
            }

            if( ! this._targets[ targetName ].hasOwnProperty( eventName ) ) {
                this._targets[ targetName ][ eventName ] = [];
            }

            this._targets[ targetName ][ eventName ].push( { callback: callback, context: context } );
            return true;
        };

        Mediator.prototype.trigger = function () {
            var args = Array.prototype.slice.call( arguments );
            var targetName = args.shift();
            var eventName = args.shift();

            if( ! this._targets.hasOwnProperty( targetName ) ) {
                return false;
            }

            if( ! this._targets[ targetName ].hasOwnProperty( eventName ) ) {
                return false;
            }

            for( var i = 0, len = this._targets[ targetName ][ eventName ].length; i < len; i++ ) {
                this._targets[ targetName ][ eventName ][ i ]
                    .callback.apply( this._targets[ targetName ][ eventName ][ i ].context, args );
            }
            return true;
        };

        Mediator.prototype.off = function ( targetName, eventName, callback ) {
            if( ! this._targets.hasOwnProperty( targetName ) ) {
                return false;
            }

            if( ! this._targets[ targetName ].hasOwnProperty( eventName ) ) {
                return false;
            }

            if ( ! callback ){
                this._targets[ targetName ][ eventName ] = [];
                return true;
            }

            for( var i = 0, len = this._targets[ targetName ][ eventName ].length; i < len; i++ ) {
                if( this._targets[ targetName ][ eventName ][ i ].callback === callback ) {
                    this._targets[ targetName ][ eventName ].splice( i, 1 );
                    return true;
                }
            }

            return false;
        };

        Mediator.prototype.inQueue = function(){
            var args = Array.prototype.slice.call( arguments );
            var targetName = args.shift();
            var eventName = args.shift();
            var that = this;
            var copy = arguments;

            if( ! this._targets.hasOwnProperty( targetName ) ) {
                setTimeout(function(){
                    Mediator.prototype.inQueue.apply(that, copy);
                }, 10)
            } else {
                Mediator.prototype.trigger.apply(this, arguments);
            }
        };

        Mediator.prototype.detach = function(targetName){
            if (this._targets.hasOwnProperty(targetName)){
                delete this._targets[targetName];
            }
        };

        return Mediator;

    } )( window ));
});