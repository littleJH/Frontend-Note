# Error Boundary 错误边界

---

一个组件，可以捕获发生在其 **子组件树** 中 **同步的** *JavaScript* 错误（渲染期间、生命周期函数、构造函数），同时打印错误，并展示降级 UI

由于只能捕获同步错误，因此以下错误是无法捕获的：

- 事件处理
- 异步代码
- 服务端渲染
- `<ErrorBoundary>` 组件自身的错误



## 实现

主要用到两个 *api*

- *`componentDidCatch(error, info):void`* 
  - 功能：用于记录错误日志
  - 运行时机：页面渲染完成以后，这时页面已经崩溃，之后会重新渲染整个应用，当然对于在错误边界内会显示降级UI

- *`static getDerivedStateFromError(error):state `*
  - 功能：用于改变 *state*，从而显示错误消息
  - 运行时机：页面渲染过程中，这时能够发现错误并直接显示降级 UI



`<ErrorBoundary>` 基本实现

```jsx
import React, { Component } from 'react'

export default class ErrorBoundary extends Component {

  constructor(props) {
    super(props)
    this.state = {
      hasError: false
    }
  }


  // 用于记录错误日志
  componentDidCatch(error, info) {
    console.error("🚀~ error, info:", error, info)
  }

  // 用于更改错误状态从而渲染错误信息
  static getDerivedStateFromError(error) {
    console.error("🚀~ error:", error)
    return {
      hasError: true
    }
  }

  render() {
    return (
      <div>
        {this.state.hasError ? <h1>Something went wrong.</h1> : this.props.children}
      </div>
    )
  }
}

```



当然也有现成的库：[react-error-boundar](https://www.npmjs.com/package/react-error-boundary)，不过依然是基于类组件的

> 在函数式组件中没有与 `componentDidCatch` 作用完全相同的函数。如果你想要避免创建类式组件，那么可以单独写一个像上面一样的 `错误边界` 并在整个应用中使用它。又或者，你可以使用 [`react-error-boundary`](https://github.com/bvaughn/react-error-boundary) 包，它可以完成同样的工作。

