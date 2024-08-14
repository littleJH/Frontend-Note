# JavaScript语言提升 ES6+

## Object.is()

功能与 `===` 几乎相同

区别： `NaN` `+0 & -0` 

```css
NaN === NaN // false
Object.is(NaN, NaN)  // true

+0 === -0 // true
Object.is(+0, -0) // false
```

# 事件循环

[事件循环](https://www.notion.so/af2d941e66e1484f8d3139bd610d83c3?pvs=21)

# Promise

[**Promises A+**](JavaScript%E8%AF%AD%E8%A8%80%E6%8F%90%E5%8D%87%20ES6+%20f819e28d44d74061bed862c6968c5e60/Promises%20A+%20fd6d23e679b54ae9a445802907ae28cc.md)

[手写 Promise](JavaScript%E8%AF%AD%E8%A8%80%E6%8F%90%E5%8D%87%20ES6+%20f819e28d44d74061bed862c6968c5e60/%E6%89%8B%E5%86%99%20Promise%20df39c0b6f3174776b7f528fb53be533b.md)

[笔试题](JavaScript%E8%AF%AD%E8%A8%80%E6%8F%90%E5%8D%87%20ES6+%20f819e28d44d74061bed862c6968c5e60/%E7%AC%94%E8%AF%95%E9%A2%98%2074765ac3e08746fda34873ea1e460d16.md)

# Featch Api

[基本使用](JavaScript%E8%AF%AD%E8%A8%80%E6%8F%90%E5%8D%87%20ES6+%20f819e28d44d74061bed862c6968c5e60/%E5%9F%BA%E6%9C%AC%E4%BD%BF%E7%94%A8%20606feb0cc4af4aaa97b8b596fef12a64.md)

[Request 对象](JavaScript%E8%AF%AD%E8%A8%80%E6%8F%90%E5%8D%87%20ES6+%20f819e28d44d74061bed862c6968c5e60/Request%20%E5%AF%B9%E8%B1%A1%20280c1feef941405180b2a6be896df1e0.md)

[Response 对象](JavaScript%E8%AF%AD%E8%A8%80%E6%8F%90%E5%8D%87%20ES6+%20f819e28d44d74061bed862c6968c5e60/Response%20%E5%AF%B9%E8%B1%A1%205fb30156ae7740bdaec309fdb3c8d442.md)

[Headers 对象](JavaScript%E8%AF%AD%E8%A8%80%E6%8F%90%E5%8D%87%20ES6+%20f819e28d44d74061bed862c6968c5e60/Headers%20%E5%AF%B9%E8%B1%A1%207d98d22b62c4439fa407d83e60e73a80.md)

[文件上传](JavaScript%E8%AF%AD%E8%A8%80%E6%8F%90%E5%8D%87%20ES6+%20f819e28d44d74061bed862c6968c5e60/%E6%96%87%E4%BB%B6%E4%B8%8A%E4%BC%A0%20c97a449d3ea34054a5a6ac744944ccf1.md)

# 迭代器和生成器

> 斐波那契数列迭代器
> 

[](https://github.com/littleJH/Real-Combat-Of-Duyi/blob/b12af8702ba54656256140d7c766db519d19b753/练习/迭代器与生成器/fibonacciIterator.js)

```jsx
// 斐波那契数列迭代器

function createFibonacciIterator() {
  let n = 1
  let prev0 = 1,
    prev1 = 1

  return {
    next() {
      const result = {
        value: prev0 + prev1,
        done: false,
      }
      prev0 = prev1
      prev1 = result.value
      n++
      return result
    },
  }
}

const feiboIter = createFibonacciIterator()

for (let i = 0; i < 10; i++) {
  console.log('🚀 ~ feiboIter.next():', feiboIter.next())
}

```

## 生成器

> 斐波那契数列生成器
> 

[](https://github.com/littleJH/Real-Combat-Of-Duyi/blob/b12af8702ba54656256140d7c766db519d19b753/练习/迭代器与生成器/fibonacciGenerator.js)

```jsx
// 斐波那契数列生成器

function* fibonacciGenerator() {
  let current = 0,
    next = 1
  while (true) {
    const reset = yield current
    ;[current, next] = [next, current + next]
    if (reset) {
      current = 0
      next = 1
    }
  }
}

const sequence = fibonacciGenerator()
console.log(sequence.next().value) // 0
console.log(sequence.next().value) // 1
console.log(sequence.next().value) // 1
console.log(sequence.next().value) // 2
console.log(sequence.next().value) // 3
console.log(sequence.next().value) // 5
console.log(sequence.next().value) // 8
console.log(sequence.next(true).value) // 0
console.log(sequence.next().value) // 1
console.log(sequence.next().value) // 1
console.log(sequence.next().value) // 2

```

## 生成器应用：异步任务控制

[](https://github.com/littleJH/Real-Combat-Of-Duyi/blob/d24e8785501b8f4b832891c7dca7617460eac6fe/练习/迭代器与生成器/runAsync.js)

```jsx
function* task() {
  console.log('start run task')
  const response = yield fetch('https://www.baidu.com/')
  const text = yield response.text()
  console.log('🚀 ~ function*task ~ text:', text)

  return text
}

function run(generatorFunction) {
  const generator = generatorFunction()
  let result = generator.next() // 启动任务

  function handerResult() {
    if (result.done) {
      return // 如果任务完成，不做任何处理
    }
    if (typeof result.value.then === 'function') {
      // 如果是异步任务，等待完成再进行下一次迭代
      result.value.then(
        (data) => {
          result = generator.next(data)
          handerResult()
        },
        (err) => generator.throw(err),
      )
    }
    // 不是异步任务，直接进行下一次迭代
    else {
      result = generator.next(result.value)
      handerResult()
    }
  }

  handerResult()
}

run(task)

```

# 代理与反射

## Reflect

积极拥抱 *函数式编程（api）*，消除 *魔法*

> 什么是魔法？
> 

对属性内存的读写、原型链的修改、函数的调用等，这些属于底层实现，属于一种魔法。简而言之：关键字、运算符。

因此，将这些功能提取出来，形成一个个的 api，并高度聚合到一个对象中：Reflect。

## Proxy

> 代理 proxy 的实质就是对Reflect上的方法进行底层的修改。
>