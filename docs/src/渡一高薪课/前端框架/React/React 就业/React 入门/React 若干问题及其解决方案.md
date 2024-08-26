# React 若干问题及其解决方案

记录在学习 `React` 的过程中遇到的问题

---



### 类组件事件处理函数的 this 指向

在 *类组件* 中事件处理函数的 `this` 并不会指向组件本身，需要手动进行修正

```jsx
class MyComponent extends React.Component {
    constructor () {
        super()
        // 方案1：使用 bind 绑定 this 指向
        this.clickHandler = this.clickHandler.bind(this)
    }
    
    clickHandler () {
        console.log(...argument)
    }
    
    render () {
        return (
            // 方案 2：使用箭头函数
        	<button onClick={(e) => this.clickHandler(e)}></button>
        )
    }
}

```





### `state` 的更新*可能* 是异步的

在事件处理函数中，`state` 的更新是异步的，将更新任务添加到一个队列中等待 **统一更新**

出于性能考虑，`React` 会将多次 `setState` 合并，所以 `setState` 回调函数获取的值是合并更新后最新的 `state`，并且 `render` 只会重新执行一次

```jsx
class MyComponent {
    constructor() {
        this.state = {
            age: 1
        }
    }
    handleClick () {
        this.setState((state, props) => ({
            age: state.age + 1
        }), (newState) => {
            // 这里最终会打印 4，因为 3 次 setState 是合并执行的
            console.log(newState)	
        })
        
        this.setState((state, props) => ({
            age: state.age + 1
        }))
        
        this.setState((state, props) => ({
            age: state.age + 1
        }))               
    }
    
    // render 函数也只会重新执行一次
    render () {
        return (<div></div>)
    }
}
```





### 非 TS 类组件的默认值和类型检查



#### 默认值 `static defaultProps`

```js
MyComponent.defaultProps {
    name: 'myname',
	age: '22'
}
```



#### 类型检查 `static propTypes`

[github: prop-types](https://github.com/facebook/prop-types)

<img src="https://raw.githubusercontent.com/littleJH/PicBed/main/img/image-20240819141024370.png" alt="image-20240819141024370" style="zoom:50%;" />	

<img src="https://raw.githubusercontent.com/littleJH/PicBed/main/img/image-20240819141241520.png" alt="image-20240819141241520" style="zoom:50%;" />	



示例：

```jsx
import PropTypes from 'prop-types';

class Greeting extends React.Component {
  static propTypes = {
    name: PropTypes.string
  };

  render() {
    return (
      <h1>Hello, {this.props.name}</h1>
    );
  }
}
```

