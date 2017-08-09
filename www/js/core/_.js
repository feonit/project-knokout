/**
 * Created by Feonit on 21.07.15.
 */
define([], function(){

    // A simple function for creating simple subclasses
    function defineSubclass(superclass,  // Constructor of the superclass
                            constructor, // The constructor for the new subclass
                            methods,     // Instance methods: copied to prototype
                            statics)     // Class properties: copied to constructor
    {
        // Set up the prototype object of the subclass
        constructor.prototype = inherit(superclass.prototype);
        constructor.prototype.constructor = constructor;
        // Copy the methods and statics as we would for a regular class
        if (methods) extend(constructor.prototype, methods);
        if (statics) extend(constructor, statics);
        // Return the class
        return constructor;
    }

    // We can also do this as a method of the superclass constructor
    Function.prototype.extend = function(constructor, methods, statics) {
        return defineSubclass(this, constructor, methods, statics);
    };

    // inherit() returns a newly created object that inherits properties from the
    // prototype object p.  It uses the ECMAScript 5 function Object.create() if
    // it is defined, and otherwise falls back to an older technique.
    function inherit(p) {
        if (p == null) throw TypeError(); // p must be a non-null object
        if (Object.create)                // If Object.create() is defined...
            return Object.create(p);      //    then just use it.
        var t = typeof p;                 // Otherwise do some more type checking
        if (t !== "object" && t !== "function") throw TypeError();
        function f() {};                  // Define a dummy constructor function.
        f.prototype = p;                  // Set its prototype property to p.
        return new f();                   // Use f() to create an "heir" of p.
    }

    function mix(obj, mixin){
        for (var key in mixin){
            if (!mixin.hasOwnProperty(key) || key ==='constructor') continue;
            obj[key] = mixin[key]
        }

        return obj;
    }

    function lessMix(obj, mixin){
        for (var key in mixin){
            if (!mixin.hasOwnProperty(key) || key ==='constructor') continue;
            if (obj[key]) continue;
            obj[key] = mixin[key]
        }

        return obj;
    }

    /*
     * Copy the enumerable properties of p to o, and return o.
     * If o and p have a property by the same name, o's property is overwritten.
     * This function does not handle getters and setters or copy attributes.
     */
    function extend(o, p) {
        for(var prop in p) {                         // For all props in p.
            o[prop] = p[prop];                   // Add the property to o.
        }
        return o;
    }

    function extendOwn(o, p) {
        for(var prop in p) {                         // For all props in p.
            if (!p.hasOwnProperty(prop)) continue; // for own props in p.
            o[prop] = p[prop];                   // Add the property to o.
        }
        return o;
    }

    var ObjProto = Object.prototype;
    var toString = ObjProto.toString;

    var _ = {
        defineSubclass: defineSubclass,
        inherit: inherit,
        mix: mix,
        lessMix: lessMix,
        extend: extend,
        extendOwn: extendOwn
    };

    // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
    Array.prototype.forEach.call(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
        _['is' + name] = function(obj) {
            return toString.call(obj) === '[object ' + name + ']';
        };
    });

    _.isObject = function (obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    // Is a given value a boolean?
    _.isBoolean = function(obj) {
        return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
    };

    _.isEqual = function (a, b) {
        // Create arrays of property names
        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);

        // If number of properties is different,
        // objects are not equivalent
        if (aProps.length != bProps.length) {
            return false;
        }

        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];

            // If values of same property are not equal,
            // objects are not equivalent
            if (a[propName] !== b[propName]) {
                return false;
            }
        }

        // If we made it this far, objects
        // are considered equivalent
        return true;
    };

    return _;
});