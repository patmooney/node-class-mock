import assert from 'assert';
import ClassMock from '../src/class-mock';

class myClass {
    myDynamicMethod () {
        return 'original dynamic';
    }
    static myStaticMethod () {
        return 'original static';
    }
};
let myClassMock = new ClassMock( myClass );

describe( 'Static methods', () => {
    it ( 'Should handle both static + dynamic methods', () => {

        let myInstance = new myClass();

        assert.equal( myInstance.myDynamicMethod(), 'original dynamic' );
        assert.equal( myClass.myStaticMethod(), 'original static' );

        myClassMock.mock( 'myDynamicMethod', () => {
            return 'new dynamic';
        });
        myClassMock.mock( 'myStaticMethod', () => {
            return 'new static';
        });

        assert.equal( myInstance.myDynamicMethod(), 'new dynamic' );
        assert.equal( myClass.myStaticMethod(), 'new static' );

        myClassMock.unMockAll();

        assert.equal( myInstance.myDynamicMethod(), 'original dynamic' );
        assert.equal( myClass.myStaticMethod(), 'original static' );

    });
});
