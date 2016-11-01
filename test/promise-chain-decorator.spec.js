import assert from "assert";

import chain from "../src/promise-chain-decorator";

class Base {
    constructor(s) {
        this.s = s;
    }
    value() {
        return this.s;
    }
}
class Baz extends Base {
    buzz(s): string {
        return this.s + s;
    }
}
class Bar extends Base {
    @chain(Baz)
    async baz(s) {
        return new Baz(this.s + s);
    }
    @chain(() => Foo)
    async foo(s) {
        return new Foo(this.s + s);
    }
}
class Foo extends Base {
    @chain(Bar)
    async bar(s) {
        return new Bar(this.s + s);
    }
    @chain(() => Foo)
    async foo(s) {
        return new Foo(this.s + s);
    }
    @chain()
    async foo1(s) {
        return new Foo(this.s + s);
    }
}

describe("chain()", () => {
    describe("at one level deep", () => {
        it ("returns a promise", () => {
            assert(new Foo("a").bar("b") instanceof Promise);
        });

        it ("returns a promise that resolves to the correct value", async () => {
            assert((await new Foo("a").bar("b")) instanceof Bar);
        });

        it ("returns a promise with proxy methods", () => {
            assert(typeof new Foo("a").bar("b").baz === "function");
        });

        it ("returns a promise with proxy methods that resolve to the correct value", async () => {
            assert.equal(await new Foo("a").bar("b").value(), "ab");
        });
    });

    describe("at two levels deep", () => {
        it ("returns a promise", () => {
            assert(new Foo("a").bar("b").baz("c") instanceof Promise);
        });

        it ("returns a promise that resolves to the correct value", async () => {
            assert((await new Foo("a").bar("b").baz("c")) instanceof Baz);
        });

        it ("returns a promise with proxy methods", () => {
            assert(typeof new Foo("a").bar("b").baz("c").buzz === "function");
        });

        it ("returns a promise with proxy methods that resolve to the correct value", async () => {
            assert.equal(await new Foo("a").bar("b").baz("c").value(), "abc");
        });
    });

    describe("at three levels deep", () => {
        it ("returns a promise", () => {
            assert(new Foo("a").bar("b").baz("c").buzz("d") instanceof Promise);
        });

        it ("returns a promise that resolves to the correct value", async () => {
            assert.equal(await new Foo("a").bar("b").baz("c").buzz("d"), "abcd");
        });
    });

    it ("should chain on itself", async () => {
        assert.equal(await new Foo("a").foo("b").foo("c").foo("d").value(), "abcd");
    });

    it ("should chain on itself implicitly", async () => {
        assert.equal(await new Foo("a").foo1("b").foo1("c").foo1("d").value(), "abcd");
    });

    it ("should chain cyclically", async () => {
        assert.equal(await new Foo("a").bar("b").foo("c").bar("d").value(), "abcd");
    });

    it ("should chain cyclically the other direction", async () => {
        assert.equal(await new Bar("b").foo("c").bar("d").foo("e").value(), "bcde");
    });

    it ("should throw when passing undefined", () => {
        assert.throws(() => {
            class A {
                @chain(B)
                b() {}
            }
            class B {
            }
        });
    });
})
