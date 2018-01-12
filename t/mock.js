import assert from 'assert';
import ClassMock from '../src/class-mock';

class TestClass {
    myMethod () {
        throw ( "I should be overriden" );
    }
    myOtherMethod () {
        throw ( "I totally should be called" );
    }
    proxyMethod () {
        // I will call a method you have mocked!
        this.meow = 5;
        return this.myMethod();
    }
};


const myTestClass = new TestClass();
const classMock = new ClassMock( TestClass );

describe( "The rudiments should work", () => {

    it ( "Should not accept instantiated classes", () => {
        assert.throws(
            () => { new ClassMock( new TestClass() ); },
            /un\-instantiated classes/
        );
    });

    it ( "Should be able to mock and unmock classes", () => {

        // should throw
        assert.throws(
            () => myTestClass.myMethod(),
            /I should be overriden/
        );

        // should be mocked
        classMock.mock( 'myMethod', () => {} );
        assert.doesNotThrow( () => myTestClass.myMethod() );

        // should throw after specific unmock
        classMock.unMock( 'myMethod' );
        assert.throws(
            () => myTestClass.myMethod(),
            /I should be overriden/
        );

        // should be mocked again
        let methodMock = classMock.mock( 'myMethod', () => {} );
        assert.doesNotThrow( () => myTestClass.myMethod() );

        // should throw after unmocking on the method mock object
        methodMock.unMock();
        assert.throws(
            () => myTestClass.myMethod(),
            /I should be overriden/
        );

        // should be mocked again
        classMock.mock( 'myMethod', () => {} );
        assert.doesNotThrow( () => myTestClass.myMethod() );

        // should throw after unmocking ALL methods
        classMock.unMockAll();
        assert.throws(
            () => myTestClass.myMethod(),
            /I should be overriden/
        );
    });

    it ( "should allow the stipulation of argument tests", () => {

        classMock.mock( 'myMethod', function () { return 'I ran fine'; } )
            .shouldHaveArguments([
                { type: 'string', value: 'Hello, World!' },
                { value: 1 },
                { type: 'string', value: 'Sausages', optional: true }
            ]);

        // no args
        assert.throws(
            () => myTestClass.myMethod(),
            /Expected 2 arguments but received 0/,
            'Error expresses a lack of arguments'
        );

        // not enough args
        assert.throws(
            () => myTestClass.myMethod( 'Hello, World!' ),
            /Expected 2 arguments but received 1/,
            'Error expresses a lack of arguments'
        );

        // wrong type args
        assert.throws(
            () => myTestClass.myMethod( new Object(), /e/ ),
            /expected string got object/,
            'Error expresses an incorrect argument type'
        );

        // wrong value args
        assert.throws(
            () => myTestClass.myMethod( 'Hello, John!', 1 ),
            /'Hello, World!' deepEqual 'Hello, John!'/,
            'Error expresses an incorrect argument type'
        );

        // fails even if optional args are wrong ( although not missing )
        assert.throws(
            () => myTestClass.myMethod( 'Hello, World!', 1, 'Bacon' ),
            /'Sausages' deepEqual 'Bacon'/,
            'Error expresses incorrect optional value'
        );

        assert.equal( myTestClass.myMethod( 'Hello, World!', 1 ), 'I ran fine' );
    });

    it ( "should be able to discern object similarities", () => {
        classMock.mock( 'myMethod', function () { return 'I ran fine'; } )
            .shouldHaveArguments([
                { type: 'object', value: { num: 1, arr: [ 1, 2, 3] } },
                { type: 'object', value: [ 'a', 'b', 'c' ] }
            ]);

        // no args
        assert.throws(
            () => myTestClass.myMethod( { num: 1, arr: [ 1, 2, 3 ] }, [ 'a', 'b' ] ),
            /AssertionError.+?deepEqual/,
            'Error expresses an incorrect deep value'
        );
    });

    it ( "should fail if there are unexpected arguments", () => {
        classMock.mock( 'myMethod', function () { return 'I ran fine'; } )
            .shouldHaveArguments([
                {}, { optional: true }
            ]);

        assert.throws( () => myTestClass.myMethod() );
        assert.doesNotThrow( () => myTestClass.myMethod( 1 ) );
        assert.doesNotThrow( () => myTestClass.myMethod( 1, 2 ) );
        assert.throws( () => myTestClass.myMethod( 1, 2, 3 ) );
    });
});

describe ( "It should allow you to stipulate the return type/value", () => {

    it ( "should be able to return a resolved promise", ( done ) => {
        classMock.mock( 'myMethod' )
            .resolves( 'Such Promise!' )
            .shouldHaveArguments([ { type: 'string' } ]);

        myTestClass.myMethod( 'whatever' ).then(
            ( out ) => assert.equal( out, 'Such Promise!' ),
            ( err ) => assert.fail( err )
        ).then( done ).catch( done );
    });

    it ( "should be able to return a rejected promise", ( done ) => {
        classMock.mock( 'myMethod' )
            .rejects( 'Such Promise!' )
            .shouldHaveArguments([ { type: 'number' } ]);

        myTestClass.myMethod( 5 ).then(
            ( out ) => assert.fail( 'resolve should not be called' ),
            ( err ) => assert.equal( err, 'Such Promise!' ),
        ).then( done ).catch( done );
    });

    it ( "should be able to throw an error", () => {
        classMock.mock( 'myMethod' )
            .throws( 'Such Error!' )
            .shouldHaveArguments([ { type: 'object' } ]);

        assert.throws(
            () => myTestClass.myMethod( new Object() ),
            'Such Error!'
        );
    });

    it ( "should return whatever you want it to", () => {
        classMock.mock( 'myMethod' )
            .returns( [ 1, 2, 3 ] );

        assert.deepEqual( myTestClass.myMethod(), [ 1, 2, 3 ] );
    });

});

describe ( "It should allow you to mock multiple methods", () => {
    it ( "Should allow you to call two mocked method in serial using the correct context", () => {
        classMock.mock( 'myMethod', function () {
            return this.myOtherMethod();
        }, myTestClass );
        classMock.mock( 'myOtherMethod' )
            .returns( 'Multiple methods!' );
        assert.equal( myTestClass.myMethod(), 'Multiple methods!' );
    });
    it ( "Should allow you to call a mocked method from an unmocked method", () => {
        classMock.mock( 'myMethod', function () {
            // should be set to 5 by the unmocked method
            return this.meow;
        }, myTestClass);
        assert.equal( myTestClass.proxyMethod(), 5 );
    });
});
