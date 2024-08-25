# Portals 传送门

---



*`createPortal(children, domNode, key?)`*  允许将 *JSX* 作为 *children* 渲染到指定的 *DOM*



注意：

*portal* 只改 *DOM* 节点所处的位置

而 <u>事件冒泡</u> 和 <u>上下文 *context*</u> 仍然是根据 *JSX* 所处 <u>*React* 组件树</u> 中的位置来分别 <u>获取上下文对象</u> 和 <u>事件冒泡</u> 的

