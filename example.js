import chain from "./promise-chain-decorator";

class Bar {
  baz() {
    return "baz";
  }
}

class Foo {
    @chain(Bar)
    async bar() { // returns Promise<Bar>
        await new Bar;
    }
}

let foo = new Foo();

foo.bar().baz().then(console.log);