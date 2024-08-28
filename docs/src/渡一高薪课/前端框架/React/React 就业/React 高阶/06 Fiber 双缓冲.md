# Fiber 双缓冲

---

> 面试题：谈一谈你对 React 中 Fiber 的理解以及什么是 Fiber 双缓冲？





## 对 Fiber 的理解

可以从三个方面切入：

- 是一种架构，称为 Fiber 架构
- 是一种数据结构
- 是一种动态的工作单元



### 架构

从 React v16 开始，React 的架构从原来的 Stack 架构改为了 Fiber 架构。

- Stack 架构：递归地更新子组件，更新流程一旦开始，便无法终止
- Fiber 架构：引入了 Schedule 调度器，更新流程变成了 “可中断的循环过程”，FiberNode 通过链表的形式串联起来，具有随时中断的特性



### 数据结构

Fiber 本质上就是一个 JS 对象，是由原来的 *ReactElement* 转换而来，包含了元素类型、链接、状态等信息

```js
function FiberNode () {
  // Instance
  this.tag = tag;
  this.key = key;
  this.elementType = null;
  this.type = null;
  this.stateNode = null;

  // Fiber 父子兄弟之间的引用
  this.return = null;
  this.child = null;
  this.sibling = null;
  this.index = 0;

  this.ref = null;
  this.refCleanup = null;

  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;
  this.dependencies = null;

  this.mode = mode;

  // Effects 副作用相关
  this.flags = NoFlags;
  this.subtreeFlags = NoFlags;
  this.deletions = null;

  this.lanes = NoLanes;	// 与调度优先级有关
  this.childLanes = NoLanes;

  this.alternate = null;
}
```



### 动态的工作单元

在每个 FiberNode 中，包含了本次更新中该 React 元素所发生变化的数据、工作的内容（增删改）、以及副作用信息



## Fiber 双缓冲

React 用 current  和 workInProgress 两棵 FiberTree 来实现更新逻辑。current tree 用于视图的渲染，workInProgress tree 用于在内存中构建，两者通过 *alternate* 属性相互引用。

在每一次更新中，所有的更新都是发生在 workInProgress tree 上，所有更新完毕后，workInProgress tree 上的状态时最新的状态，此时，通过 *alternate* 引用与 current tree 互换，用于渲染视图。

双缓冲机制既能防止只用一棵树造成的状态丢失，又能加快 DOM 的替换与更新。

### mount  阶段

**第一步：创建 *FiberRootNode* 和 *HostRootFiber***

```jsx
ReactDOM.createRoot(document.getElementById('root')).render(<App></App>)
```

*React.createRoot* 会创建一个 ***FiberRoot*** ，这是整个 React 应用的根基，称之为 *FiberRootNode*，同时会创建一个 ***RootFiber*** ，这是 FiberTree 的根节点，称之为 *HostRootFiber*

*fiber root* 有一个属性 *current*，**在第一次挂载**的过程中，会将 *current* 指向当前渲染的 FiberTree

形成如下效果：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2023-02-24-071516.png" alt="image-20230224151515483" style="zoom:50%;" />	

**第二步：处理 current tree 和 workInProgress tree**

下一步进入正式渲染阶段：

1. 首先会根据当前 current tree 的 *alternate* 复用 FiberTree。如果没有 *alternate*，才会创建新的 FiberTree 作为 workInProgress tree，同时进行 *alternate* 的相互引用。

2. 然后进入 *workLoop* 流程。*workLoop* 会对每个 fiber 调用 *beginWork* 方法，这个方法会从 *HostRootFiber* 开始进行**深度优先**遍历，根据传入的 FiberNode 创建下一级 FiberNode。

   <img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2023-02-24-072421.png" alt="image-20230224152421236" style="zoom:40%;" />	

3. 遍历结束后生成 workInProgress  tree。此时意味着 *render* 阶段结束，进入 *commit* 阶段。将构建好的 workInProgress tree 交给 renderer（渲染器）进行 UI 的渲染

4. 在 *commit*  的过程中，FiberRoot 的 *current* 会指向 workInProgress tree，作为当前渲染的 current  tree，完成双缓冲的工作

   <img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2023-02-24-072953.png" alt="image-20230224152953358" style="zoom:40%;" />	

### update 阶段

触发更新后，会创建一颗新的 workInProgress tree，并通过 *alternate* 将所有子 FiberNode 进行关联。

当 workInProgress tree 生成完毕后，就会进入 *commit* 阶段，FiberRoot 的 *current* 会指向 workInProgress tree，作为当前渲染的 current  tree，完成双缓冲的工作。

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2023-02-24-073639.png" alt="image-20230224153638862" style="zoom:40%;" />	

当再次发生更新时，会直接将 current tree 复制一份当作 workInProgress tree 进行更新。



****