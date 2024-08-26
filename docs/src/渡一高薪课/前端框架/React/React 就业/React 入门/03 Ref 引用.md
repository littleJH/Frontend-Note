# Ref

---



## 基本使用（*ref*）

---

### 1. 获取子组件中某一元素 DOM

在父组件中，可以将 *ref* 传递给子组件，在子组件中将 *props.ref* 应用到元素上，即可获取元素的 *DOM* 节点 ❌❌❌ 

错啦错啦！！！

下面的代码也是错的！！！

```jsx
function ChildInput (props) {
    return (
    	<input ref={props.ref}></input>
    )
}


function App () {
    const inputRef = useRef(null)
    const handleClick = () => {
        // 通过 ref 获取输入框 DOM，实现聚焦
        inputRef.current.focus()
    }
    return (
    	<ChildInput ref={inputRef}></ChildInput>
        <button  onClick={handleClick}>聚焦输入框</button>
    )
}
```

实际上 React 是不允许访问其它组件的 DOM 节点的！想要暴露其 DOM 节点，就要用到 *forwardRef* 这个 api，具体应用下文有



### 2. 类组件调用子组件的方法

类组件中，将 *ref* 应用到子组件上，可以直接通过 `this.childRef` 调用子组件的方法

```jsx
import React, { Component } from 'react'

// 子组件
class ChildDom extends Component {

  // 定义一个实例方法
  log() {
    console.log('this is child component')
  }

  render() {
    return (
      <div>ChildDom</div>
    )
  }
}

export default class Ref extends Component {
  constructor() {
    super()
    this.ref = React.createRef()
  }

  componentDidMount() {
    // 通过 this.ref.current 调用子组件的方法
    this.ref.current.log()
  }
  render() {
    return (
      // 将 ref 应用到子组件上
      <ChildDom ref={this.ref}></ChildDom>
    )
  }
}

```





## 高阶用法（*forwardRef*）

---

*forwardRef：*

接收来自父组件的 *ref* ，应用到子组件或 *DOM* 上，从而将父组件的 *ref* 转发下去



### 1. 跨层级转发 *ref*

应用场景：在 *Grand* 组件中想获取 *Son* 组件中某个元素的 *DOM*

```jsx
function Son () {
    
}

function Father

function Grand () {
    return 
}
```







### 2. 高阶组件转发 *ref*

设想一个场景：在高阶函数中，想要通过 *ref* 关联子组件，从而访问子组件实例，来调用子组件的方法，

但是问题来了：高阶函数直接返回一个新的组件（新的组件只能接收 *props*），如果正常写 *ref* 会被应用到新的组件上，无法传递给旧的组件。而 `forwardRef((props, ref) => {})` 正好能接收 *ref* 作为参数，然后传递给旧组件

```jsx
import React, { forwardRef, useEffect, useRef } from "react"

// 高阶组件函数
function withLogRef(WrapComponent) {
  class ForwardCom extends React.Component {
    render() {
      const { forwardRef, ...otherProps } = this.props
      // 将来自父组件的ref传递给子组件
      return <WrapComponent {...otherProps} ref={forwardRef}></WrapComponent>
    }
  }

  // 通过 forwardRef 接收来自父组件的 ref
  return forwardRef((props, ref) => {
    return <ForwardCom {...props} forwardRef={ref} ></ForwardCom>
  })
}

// MyCom.jsx
class MyCom extends React.Component {
  log() {
    console.log(' this is my com')
  }

  render() {
    return <div>this is my com</div>
  }
}

// App.jsx
const NewChild = withLogRef(MyCom)

function App() {
  const ref = useRef(null)

  useEffect(() => {
    // 调用子组件实例上的 log 方法
    ref.current.log()
  }, [])

  return (
    <div className="App">
      <NewChild ref={ref}></NewChild>
    </div>
  )
}

export default App
```

函数组件示例，不同的是，想获取的是子组件的 DOM 节点，而不是组件实例的方法，更何况，函数组件根本不存在实例

```jsx
import { forwardRef, useEffect, useRef, useState } from 'react'

const withLog = (WrapComponent) => {

  return forwardRef((props, ref) => {
    useEffect(() => {
      console.log(`${WrapComponent.Child} has been created`)
      return () => {
        console.log(`${WrapComponent.Child} has been destroied`)
      }
    }, [])
    return <WrapComponent {...props} ref={ref}></WrapComponent>
  })
}

// 将来自高阶组件的 ref 转发下去
const Child = forwardRef((props, ref) => {
  return <div>
    <h1>this is child</h1>
    <input ref={ref}></input>
  </div>
})

// 高阶函数，给 Child 组件赋能
const NewChild = withLog(Child)

function App() {
  const ref = useRef(null)

  return (
    <div className="App">
      <NewChild ref={ref}></NewChild>
      <button onClick={() => ref.current.focus()}>focus!</button>
    </div>
  )
}

export default App

```







### 3. *useImpreativeHandler*

由于函数组件是没有实例的，为了调用子组件的某些方法，就要用到 *forwardRef + useImpreativeHandler* 组合

*forwardRef* 用于接收来自父组件的 *ref*

*useImpreativeHandler* 接收三个参数

- ref：由 *forwardRef* 传递过来的 *ref* 
- createHandler: 处理函数，返回值是暴露给父组件的 *ref* 对象，对象上可以保存需要暴露的方法
- deps：依赖项，发生变化时生成新的 *ref* 对象

```jsx
const Child = forwardRef((props, ref) => {
  const inputRef = useRef(null)

  useImperativeHandle(ref, () => ({
    // 暴露一些方法给父组件，等待父祖教调用
    focus() {
      inputRef.current.focus()
    }
  }), [])
  // 注意，应用到 input 元素上的 ref，跟 forwardRef 转发的 ref，并不是同一个
  return <input ref={inputRef}></input>
})

// App.jsx

function App() {
  const ref = useRef(null)

  return (
    <div className="App">
      <Child ref={ref}></Child>
      {/* 通过 ref 访问 Child 子组件暴露的方法 */}
      <button onClick={() => ref.current.focus()}>聚焦！！</button>
    </div>
  )
}
```

注意，应用到 input 元素上的 ref，跟 forwardRef 转发的 ref，并不是同一个，

input 元素上的 *ref* 是用于获取 input 节点的，

而 *forwardRef* 转发的 *ref* 是用于保存子组件暴露的方法的

