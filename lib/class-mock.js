'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MockObject = function () {
    _createClass(MockObject, [{
        key: 'shouldHaveArguments',
        value: function shouldHaveArguments(argumentDescriptor) {
            // TODO: verify the descriptor makes sense
            this.checkStack.push(function (args) {
                var expectedArgs = argumentDescriptor.filter(function (a) {
                    return !a.optional;
                }).length;
                if (args.length < expectedArgs || args.length > argumentDescriptor.length) {
                    _assert2.default.fail('Expected ' + expectedArgs + ' arguments but received ' + args.length);
                }

                for (var i = 0; i < Math.min(args.length, argumentDescriptor.length); i++) {
                    var desc = argumentDescriptor[i];
                    var arg = args[i];

                    if (desc.type && (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) !== desc.type) {
                        _assert2.default.fail('Argument ' + i + ': expected ' + desc.type + ' got ' + (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)));
                    }
                    if (desc.value) {
                        _assert2.default.deepEqual(desc.value, arg);
                    }
                    if (desc.like) {
                        if (typeof arg !== "String") {
                            _assert2.default.fail('Argument ' + i + ': expected String got ' + (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)));
                        } else if (!desc.like.test(arg)) {
                            _assert2.default.fail('Argument ' + i + ': expected value like ' + desc.like.toString() + ' got ' + arg);
                        }
                    }
                }

                return true;
            });
            return this;
        }
    }, {
        key: 'rejects',
        value: function rejects(output) {
            this.outcome = function () {
                return Promise.reject(output);
            };
            return this;
        }
    }, {
        key: 'resolves',
        value: function resolves(output) {
            this.outcome = function () {
                return Promise.resolve(output);
            };
            return this;
        }
    }, {
        key: 'returns',
        value: function returns(output) {
            this.outcome = function () {
                return output;
            };
            return this;
        }
    }, {
        key: 'throws',
        value: function throws(output) {
            this.outcome = function () {
                throw output;
            };
            return this;
        }
    }]);

    function MockObject(outcome, unmocker) {
        _classCallCheck(this, MockObject);

        this.checkStack = [];
        this.outcome = outcome;
        this.unmocker = unmocker;
    }

    _createClass(MockObject, [{
        key: 'execute',
        value: function execute(args) {
            return !this.checkStack.find(function (check) {
                return !check(args);
            });
        }
    }, {
        key: 'unMock',
        value: function unMock() {
            this.unmocker();
        }
    }]);

    return MockObject;
}();

;

/** class-mock - for mocking classes
* @description Allows you to override methods belonging to classes
* @class
* @example 
* const myMock = new ClassMock( OtherClass );
* const mockMethod = myMock.mock( 'someMethod' )
*   .shouldHaveArguments([
*       { type: "String", value: "John" },
*       { like: new RegExp('smith','i') },
*       { type: "Object" }
*   ])
*   .resolves( "Welcome John Smith" )
*/

var _class = function () {
    function _class(classObject) {
        _classCallCheck(this, _class);

        if (typeof classObject !== 'function') {
            throw 'node-class-mock can only be used by un-instantiated classes';
        }
        this.subject = classObject;
        this.__MOCK = {};
    }

    /** mock
    * @method mock
    * @sync
    * @description - override a class method with the given callback
    * @param {String} [methodName] - name of method belonging to subject
    * @param {Function} [callback] - to be executed in place of the method
    * @param {Object} [context] - An instantiated class to act as 'this' in your callback
    * @returns {Function} [mockObject]
    */


    _createClass(_class, [{
        key: 'mock',
        value: function mock(methodName) {
            for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                rest[_key - 1] = arguments[_key];
            }

            if (typeof this.subject[methodName] === 'function') {
                return this._mockStatic.apply(this, [methodName].concat(rest));
            }
            return this._mockMethod.apply(this, [methodName].concat(rest));
        }
    }, {
        key: '_mockMethod',
        value: function _mockMethod(methodName) {
            var _this = this;

            var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
                return true;
            };
            var context = arguments[2];

            if (!this.__MOCK[methodName]) {
                this.__MOCK[methodName] = { type: 'dynamic', def: this.subject.prototype[methodName] };
            }

            var mockObject = new MockObject(cb, function () {
                return _this.unMock(methodName);
            });
            this.subject.prototype[methodName] = function () {
                for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                    args[_key2] = arguments[_key2];
                }

                if (mockObject.execute(args)) {
                    var executable = context ? mockObject.outcome.bind(context) : mockObject.outcome;
                    return executable.apply(undefined, args);
                }
            };

            return mockObject;
        }
    }, {
        key: '_mockStatic',
        value: function _mockStatic(methodName) {
            var _this2 = this;

            var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
                return true;
            };
            var context = arguments[2];

            if (!this.__MOCK[methodName]) {
                this.__MOCK[methodName] = { type: 'static', def: this.subject[methodName] };
            }

            var mockObject = new MockObject(cb, function () {
                return _this2.unMock(methodName);
            });
            this.subject[methodName] = function () {
                for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                    args[_key3] = arguments[_key3];
                }

                if (mockObject.execute(args)) {
                    var executable = context ? mockObject.outcome.bind(context) : mockObject.outcome;
                    return executable.apply(undefined, args);
                }
            };

            return mockObject;
        }

        /** unMock
        * @method unMock
        * @sync
        * @description - Will remove any mocks placed on the specified method name
        * @param {String} [methodName]  - name of method to remove override
        */

    }, {
        key: 'unMock',
        value: function unMock(methodName) {
            var methodDef = this.__MOCK[methodName];
            if (methodDef.type === 'static') {
                this.subject[methodName] = methodDef.def;
            } else {
                this.subject.prototype[methodName] = methodDef.def;
            }
            delete this.__MOCK[methodName];
        }

        /** unMockAll
        * @method unMockAll
        * @sync
        * @description - Will remove any mocks placed on all class methods
        */

    }, {
        key: 'unMockAll',
        value: function unMockAll() {
            var _this3 = this;

            Object.keys(this.__MOCK).forEach(function (method) {
                return _this3.unMock(method);
            });
        }
    }]);

    return _class;
}();

exports.default = _class;
