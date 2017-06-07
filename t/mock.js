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
    it ( "Should be able to mock and unmock classes", () => {
        let didRun = 0, didFail = 0;

        // should throw
        try { myTestClass.myMethod(); }
        catch ( e ) {
            didFail++;
            assert.ok( /I should be overriden/.test( e ), 'Javascript seems to be working' );
        }

        // should be mocked
        classMock.mock( 'myMethod', () => { didRun++; } );
        myTestClass.myMethod();

        // should throw after specific unmock
        classMock.unMock( 'myMethod' );
        try { myTestClass.myMethod(); }
        catch ( e ) { didFail++; }

        // should be mocked again
        let methodMock = classMock.mock( 'myMethod', () => { didRun++; } );
        myTestClass.myMethod();

        // should throw after unmocking on the method mock object
        methodMock.unMock();
        try { myTestClass.myMethod(); }
        catch ( e ) { didFail++; }

        // should be mocked again
        classMock.mock( 'myMethod', () => { didRun++; } );
        myTestClass.myMethod();

        // should throw after unmocking ALL methods
        classMock.unMockAll();
        try { myTestClass.myMethod(); }
        catch ( e ) { didFail++; }

        assert.equal( didFail, 4, "The method failed as expected" );
        assert.equal( didRun, 3, "The overriden method works fine" );
    });

    it ( "should allow the stipulation of argument tests", () => {

        classMock.mock( 'myMethod', function () { return 'I ran fine'; } )
            .shouldHaveArguments([
                { type: 'string', value: 'Hello, World!' },
                { value: 1 },
                { type: 'string', value: 'Sausages', optional: true }
            ]);

        // no args
        try {
            myTestClass.myMethod();
        }
        catch( e ) {
            assert.ok( /Expected 2 arguments but received 0/.test(e), `Error expresses a lack of arguments: ${e}` );
        }

        // not enough args
        try {
            myTestClass.myMethod( 'Hello, World!' );
        }
        catch( e ) {
            assert.ok( /Expected 2 arguments but received 1/.test(e), `Error expresses a lack of arguments: ${e}` );
        }

        // wrong type args
        try {
            myTestClass.myMethod( new Object(), /e/ );
        }
        catch( e ) {
            assert.ok( /expected string got object/.test(e), `Error expresses an incorrect argument type: ${e}` );
        }

        // wrong value args
        try {
            myTestClass.myMethod( 'Hello, John!', 1 );
        }
        catch( e ) {
            assert.ok( /'Hello, World!' deepEqual 'Hello, John!'/.test(e), `Error expresses an incorrect argument type: ${e}` );
        }

        // fails even if optional args are wrong ( although not missing )
        try {
            myTestClass.myMethod( 'Hello, World!', 1, 'Bacon' );
        }
        catch ( e ) {
            assert.ok( /'Sausages' deepEqual 'Bacon'/.test(e), `Error expresses incorrect optional value: ${e}` );
        }

        assert.equal( myTestClass.myMethod( 'Hello, World!', 1 ), 'I ran fine' );

    });

    it ( "should be able to discern object similarities", () => {
        classMock.mock( 'myMethod', function () { return 'I ran fine'; } )
            .shouldHaveArguments([
                { type: 'object', value: { num: 1, arr: [ 1, 2, 3] } },
                { type: 'object', value: [ 'a', 'b', 'c' ] }
            ]);

        // no args
        try {
            myTestClass.myMethod(
                { num: 1, arr: [ 1, 2, 3 ] },
                [ 'a', 'b' ]
            );
        }
        catch( e ) {
            assert.ok( /AssertionError.+?deepEqual/.test(e), `Error expresses a lack of arguments: ${e}` );
        }
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

        let didThrow = false;
        try {
            myTestClass.myMethod( new Object() );
        }
        catch( e ) {
            assert.equal( e, 'Such Error!' );
            didThrow = true;
        }

        assert.ok( didThrow );
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


