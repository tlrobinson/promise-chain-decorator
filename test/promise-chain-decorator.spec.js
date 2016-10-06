import assert from "assert";

import chain from "../promise-chain-decorator";

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
}
class Foo extends Base {
    @chain(Bar)
    async bar(s) {
        return new Bar(this.s + s);
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

})
