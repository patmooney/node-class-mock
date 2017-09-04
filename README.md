# node-class-mock #

Allows you to mock Class methods for use in testing with a few extra testy bits thrown in.

## Example ##

This will replace the method on our TestClass prototype to a method which firstly checks
the arguments passed to it and will assert.fail in the event of errors. It will then return
a resolved Promise with the given output.

``` javascript

    // First, instantiate ClassMock with the class you would like to mock
    const classMock = new ClassMock( TestClass );

    // Then replace one of the methods
    const methodMock = classMock.mock( 'myMethod' )
        .shouldHaveArguments([
            { type: 'string', value: 'Hello, World!' },
            { value: 1 },
            { type: 'string', value: 'Sausages', optional: true }
        ])
        .resolves( 'Such Promise resolution!' )

    // Then anything which calls your mocked-method will
    // have it's inputs checked and receieve a resolved promise
    // ( other outcomes are available )
    const myTestClass = new TestClass();
    myTestClass.doStuff( 'Hello, World!', 1 ).then(
        out => console.log( 'Hey, my test works!' )
    );

    // Finally, remember to un-mock!
    methodMock.unMock();

```

To start-a-mocking, simply instantiate a ClassMock with your desired class ( non instantiated ). The ClassMock object exposes the following methods...

## ClassMock ##

This can be considered the mock factory or the mock father or the mock-mack-daddy. Having instantiated it with your desired class, it
will produce little method mock children.

 - **mock**

    Main entry for overriding methods

    **Arguments**

    - **methodName** [Stirng] - Name of class method to override
    - **callback** [Function, Optional] - Function to use as mock
    - **context** [Object, Optional] - An instantiated object which acts as **this** in your override method

    **Returns**

    -   **methodMock** [Object] - A representation of the mock dynamic

 - **unMock**

    Reinstates original method

    **Arguments**

    - **methodName** [String] - Name of method to reinstate

 - **unMockAll**

    Reinstate all mocked methods

## Method Mocking ##

When calling **mock** on the mock-father you will receive back an object which exposes these methods...

 - **shouldHaveArguments**

    Provide a list of expected arguments, assert.fail if any are amiss

    **Arguments**

    - **argumentDescriptorList** [Array|Object] - A list of objects describing each expected parameter

        - value - The expected value
        - type - The *typeof* the argument
        - optional - Some arguments are optional

 - **resolves**

    The overriden method will result in a resolved Promise being returned with the given value.

    **Arguments**

    - **output** - Value to resolve

 - **rejects**

    The overriden method will result in a rejected Promise being returned with the given error.

    **Arguments**

    - **error** - Value to reject

 - **returns**

    The overriden method will result in the specified value being returned.

    **Arguments**

    - **output** - Value to reject

 - **throws**

    The overriden method will result in the given error being thrown

    **Arguments**

    - **error** - Value to throw

 - **unMock**

    Reinstate the original function

### To develop ###

    npm install
    npm test

### To compile ###

    babel src/class-mock.js -o lib/class-mock.js

### ... to be continued ###
