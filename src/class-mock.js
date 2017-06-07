import assert from 'assert';

class MockObject {
    shouldHaveArguments ( argumentDescriptor ) {
        // TODO: verify the descriptor makes sense
        this.checkStack.push( ( args ) => {
            let expectedArgs = argumentDescriptor.filter( a => ! a.optional ).length;
            if ( args.length < expectedArgs || args.length > argumentDescriptor.length ) {
                assert.fail( `Expected ${expectedArgs} arguments but received ${args.length}` );
            }

            for ( let i = 0; i < Math.min( args.length, argumentDescriptor.length ); i++ ){
                let desc = argumentDescriptor[i];
                let arg = args[i];

                if ( desc.type && typeof( arg ) !== desc.type ) {
                    assert.fail( `Argument ${i}: expected ${desc.type} got ${typeof( arg )}` );
                }
                if ( desc.value ){
                    assert.deepEqual( desc.value, arg );
                }
                if ( desc.like ){
                    if ( typeof( arg ) !== "String" ) {
                        assert.fail( `Argument ${i}: expected String got ${typeof( arg )}` );
                    }
                    else if ( ! desc.like.test( arg ) ){
                        assert.fail( `Argument ${i}: expected value like ${desc.like.toString()} got ${arg}` );
                    }
                }
            }

            return true;
        });
        return this;
    }
    rejects ( output ) {
        this.outcome = () => Promise.reject( output );
        return this;
    }
    resolves ( output ) {
        this.outcome = () => Promise.resolve( output );
        return this;
    }
    returns ( output ) {
        this.outcome = () => output;
        return this;
    }
    throws ( output ) {
        this.outcome = () => { throw( output ); };
        return this;
    }
    constructor( outcome, unmocker ) {
        this.checkStack = [];
        this.outcome = outcome;
        this.unmocker = unmocker;
    }
    execute ( args ) {
        return ! this.checkStack.find(
            ( check ) => ! check( args )
        );
    }
    unMock() {
        this.unmocker();
    }
};

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
export default class {

    constructor ( classObject ) {
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
    mock ( methodName, cb = function () { return true; }, context ) {
        if ( ! this.__MOCK[methodName] ) {
            this.__MOCK[methodName] = this.subject.prototype[methodName];
        }

        let mockObject = new MockObject( cb, () => this.unMock( methodName ) );
        this.subject.prototype[methodName] = ( ...args ) => {
            if ( mockObject.execute(args) ){
                let executable = context ?
                    mockObject.outcome.bind( context ) :
                    mockObject.outcome;
                return executable( ...args );
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
    unMock( methodName ) {
        this.subject.prototype[methodName] = this.__MOCK[methodName];
        delete this.__MOCK[methodName];
    }

    /** unMockAll
    * @method unMockAll
    * @sync
    * @description - Will remove any mocks placed on all class methods
    */
    unMockAll() {
        Object.keys( this.__MOCK ).forEach( method => this.unMock( method ) );
    }
}
