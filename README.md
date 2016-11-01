promise-chain-decorator
=======================

A simple to use decorator that automatically adds proxy methods to promises returned by a method,
allowing you to easily chain.

Works for multiple levels.

Example
-------

    import chain from "./promise-chain-decorator";

    class Base {
        constructor(s) {
            this.s = s;
        }
    }

    class Baz extends Base {
        buzz(s) {
            return this.s + s;
        }
    }

    class Bar extends Base {
        @chain(Baz)
        async baz(s) {
            return new Baz(this.s + s);
        }
    }

    class Foo extends Base {
        @chain(Bar)
        async bar(s) {
            return new Bar(this.s + s);
        }
    }

    new Foo("a").bar("b").baz("c").buzz("d").then((result) => console.log(result));

Recursion and cycles
--------------------

If a methods returns itself or another instance of itself, you can leave off the argument to the `@chain` decorator to indicate it returns an instance of itself, e.x. `@chain()`.

If a method returns an instance of a class that is defined after it's own class, the `@chain` decorator must be passed a method that returns the constructor instead of the class itself, since it will be undefined, e.x. `@chain(() => AnotherClass)`.

```
class Foo {
    @chain()
    async foo() {
        // returns "this" or "new Foo" etc
    }

    @chain(() => Bar)
    async bar() {
        // returns "new Bar" etc
    }
}

// Bar is defined after Foo
class Bar {
    // ...
}

// now you can do this, etc:
new Foo().bar().foo().foo().foo().bar()
```


License
-------

Copyright (c) 2016 Thomas Robinson

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
