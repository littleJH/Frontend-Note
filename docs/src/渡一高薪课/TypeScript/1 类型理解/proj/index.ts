function myTuple<T extends any[]>(...arr: T) {
    return arr
}

const t =  myTuple(1, 2, 3)

type User = {
    id: string
    name: number
}

type UserKeys = User[keyof User]

type HtmlElementType = HTMLElementTagNameMap[keyof HTMLElementTagNameMap]
document.createElement('div')

type Foo = {
    [key in'a' | 'b']: string
}

type B = keyof unknown & {}

type readonlyFoo = Readonly<Foo>

type MyRecord = 