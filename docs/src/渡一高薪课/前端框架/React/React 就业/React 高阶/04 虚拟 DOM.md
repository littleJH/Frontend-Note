# 虚拟 *DOM*

---



>  面试题：什么是虚拟 *DOM* ？其优点有哪些？



解题思路：

>1. 虚拟 DOM 的来源
>2. 虚拟 DOM 和 js 对象的关系
>3. 使用虚拟 DOM 的体积和速度优势
>4. 多平台渲染的抽象能力
>5. React 中的虚拟 DOM



参考答案：

> 1. 虚拟 DOM 最早是由 React 团队提出的概念，是针对 UI 的一种描述
>
> 2. 虚拟 DOM 本身是一种编程概念，核心思想是使用 JS 对象来描述 DOM 的层次结构。因此，前者是一种**思想**，而后者是对前者的**具体实现**
>
> 3. 虽然虚拟 DOM 最终还是要用原生 DOM api 去操作 DOM，但是由于它体积非常小，所以计算速度要远高于真实 DOM。这就导致虚拟 DOM 真正发挥作用的是更新阶段，而首次渲染阶段，实际上是比直接操作原生 DOM api 要慢的。
>
>    因此，在首次渲染时，React 团队推荐使用 *innerHTML* 而不是操作真实的DOM，因为解析字符串的速度是远远快于创建 JS 对象的。
>
>    > 首次渲染， *innerHTML* 对比虚拟DOM
>
>    |              | innerHTML         | 虚拟 DOM          |
>    | :----------- | :---------------- | ----------------- |
>    | JS 层面计算  | 解析字符串        | 创建 JS 对象      |
>    | DOM 层面计算 | 创建对应的DOM节点 | 创建对应的DOM节点 |
>
>    而在更新阶段，如果使用 *innerHTML* 就意味着所有DOM都要被销毁并重新创建，而虚拟DOM只需要增删改查发生变化的DOM节点即可。
>
> 4. 虚拟DOM只是对UI的描述，不同平台可以执行不同的渲染逻辑，例如：
>
>    1. 浏览器、Nodejs 环境使用 *ReactDOM* 包
>    2. React Native 环境使用 *ReactNative* 包
>
> 5. React 使用 JSX 描述 UI，最终会被 *Babel* 编译成 *createElement* 或 *jsx* 的方法调用，返回虚拟DOM 对象，官方称之为 “ React 元素 ” 
>
>    ```jsx
>    const Child = () => <div></div>
>    
>    React.memo(() => (
>    	<Child>
>        	<div>
>            	<Child />
>            </div>
>        </Child>
>    ))
>    
>    
>    // 上面的 JSX 会被编译成 "jsx" 的方法调用
>    import { jsx as _jsx } from "react/jsx-runtime";
>    function Child() {
>      return /*#__PURE__*/_jsx("div", {});
>    }
>    React.memo(() => /*#__PURE__*/_jsx(Child, {
>      children: /*#__PURE__*/_jsx("div", {
>        children: /*#__PURE__*/_jsx(Child, {})
>      })
>    }));
>    ```

