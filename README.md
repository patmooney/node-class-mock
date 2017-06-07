# node-class-mock #

Allows you to mock Class methods for use in testing with a few extra testy bits thrown in.

## Example ##

This will replace the method on our TestClass prototype to a method which firstly checks
the arguments passed to it and will assert.fail in the event of errors. It will then return
a resolved Promise with the given output.

    const myTestClass = new TestClass();
    const classMock = new ClassMock( TestClass );

    const methodMock = classMock.mock( 'myMethod' )
        .shouldHaveArguments([
            { type: 'string', value: 'Hello, World!' },
            { value: 1 },
            { type: 'string', value: 'Sausages', optional: true }
        ])
        .resolves( 'Such Promise resolution!' )

To start-a-mocking, simply instantiate a ClassMock with your desired class ( non instantiated ). The ClassMock object exposes the following methods...

 - ### mock ###
    Main entry for overriding methods
    ###### Arguments ######
    - **methodName** [Stirng] - Name of class method to override
    - **callback** [Function, Optional] - Function to use as mock
    - **context** [Object, Optional] - An instantiated object which acts as **this** in your override method

    ###### Returns ######
    -   **methodMock** [Object] - A representation of the mock dynamic
 - ### unMock ###
    Reinstates original method
    ###### Arguments #####
    - **methodName** [String] - Name of method to reinstate

 - ### unMockAll ###
    Reinstate all mocked methods

When calling **mock** you will receive back an object which exposes these methods...

 - ### shouldHaveArguments ###
    Provide a list of expected arguments, assert.fail if any are amiss
 - ###### Arguments ######
    - **argumentDescriptorList** [Array|Object] - A list of objects describing each expected parameter
        - value - The expected value
        - type - The *typeof* the argument
        - optional - Some arguments are optional

 - ### rejects ###
    The overriden method will result in a rejected Promise
    ###### Arguments #####
    - **output** - Value to reject


... to continue

### To develop ###

    npm install
    npm test

### To compile ###

    babel src/class-mock.js -o lib/class-mock.js
