# React Diff 算法

---

> 面试题：React 中的 diff 算法有没有了解过？具体的流程是怎么样的？React 为什么不采用 Vue 的双端对比算法？

 

首先需要明确，diff 对比的是 ***currentFiberNode* 和 *ReactElement (JSX)***，然后根据 diff 结果生成新的 *workInProgress tree*



**React 的 diff 有三个特点**

- 只会对同层级的元素进行 diff，如果同一元素仅仅是层级发生了变化，React diff 也会直接销毁并重新创建
- 开发者可以通过 key 来设置在 diff 中需要保留的元素（在type不变仅顺序变化的情况下）
- 对于 key 相同（key 都为 null 也视为相同）的情况下，如果 type 发生了变化，那么直接销毁并创建新的元素

产生这些限制的原因是，如果完整比较两个树，那么产生的空间复杂度是 O (n<sup>3</sup>) ，这带来的性能消耗是巨大的



**React 的 diff 发生在 *reconcileChildFibersImpl* 这个函数中**

-  判断 newChild 的类型

  - `typeof newChild === 'object' && newChild !== null`

    此时 newChild 可能是对象也可能是数组

    - 对象：进行单节点 diff
    - 数组：进行多节点 diff

  - `(typeof newChild === 'string' && newChild !== '') || typeof newChild === 'number' || typeof newChild === 'bigint'`

    文本节点，节点可以复用，直接更新节点文本即可



**React 为什么不采用 Vue 的双端对比？**

作者在代码中注释说明了，由于双端对比需要向前查找，而 FiberNode 并没有反向指针，只能通过 *sibling* 查找下一个 FiberNode，因此无法使用双端对比。

那么为什么不设置反向指针？并使用双端对比？下面是官方的解释

>即使是双端对比算法，我们也要对这种情况进行优化，我们应该使用 Map 这种数据结构方案去替代原来那种几乎没有什么变化也进行暴力比较的方案。它第一次搜索循环是通过 forward-only 这种模式（就是**只从左向右查找**），（第一次循环可能还没有结束，还有节点没有比对的时候）如果还要继续向前循环查找那么就要通过 Map 这种数据类型了。（就目前这个单向链表的数据结构，如果采用）双端对比查找算法比较难控制它反向查找的，但它确实是一种成功的算法。此外，双端对比算法的实现也在我们的工作迭代当中。





## 单节点 diff

单节点指的是新元素只有一个节点，旧节点数量不定

- key 相同 （key 为 null 也视为相同）
  - type 相同，复用 Fiber
  - type 不同，不能复用
- key 不同，直接不能复用，创建新 Fiber





## 多节点 diff

多节点指的是新的节点有多个

步骤：

- 第一次遍历，判断新节点是否是 object 类型，如果不是，例如 string 和 number，则直接更新节点，如果节点的类型是 object 且不为 null，会会开始判断 key 和 type

  1. 如果key相同，继续判断 type 是否相同
     1. type相同：复用 fiber
     2. type不同：根据 ReactElement创建一个全新的Fiber
  2. 返回复用的或者创建 Fiber
     1. 如果这个 Fiber 为 null，说明 key 不同，直接跳出第一次遍历

  推出第一次遍历的原因有两种：newChild 都遍历完了，或者，遇到了 key 不相同的新旧元素

  经过第一次遍历后，会产生三种情况

  1. newChild 遍历完了，oldFiber 没遍历完，则剩余的 oldFiber 要删除，将它们放入 *deletions* 这个数组中，等待最后统一删除
  2. newChild 没遍历完，oldFiber 遍历完了，则剩余的 newChild 要创建，根据对应的 ReactElement 创建新的 Fiber 即可
  3. newChild 和 oldFiber 都没遍历完，那么就进入第二次遍历

- 第二次遍历：

  将剩余的 oldFiber 放入一个 Map 中，这个 Map 的键是 Fiber.key 或者 FIber.index，值是 Fiber 本身

  然后遍历剩余的 newChild，在 Map 中寻找是否有可复用的，如果有，移动，如果没有，新增 Fiber

  遍历完以后如果 oldFiber 中还有剩余的，一样放入 *deletions* 这个数组中，等待最后统一删除



那么问题来了，根据什么移动呢？这就涉及 *placeChild* 这个函数了

这个函数的作用是计算**最后一个可复用 FIber 的位置**

首先会给**新的 Fiber.index** 赋值为新节点在多节点数组中的索引

然后判断当前发生更新的位置

- 如果发生更新的位置在原来位置的左边

  为**新 FIber** 打上  *Placement* 标签，意味着这个 Fiber 是要移动的，并返回原来的位置

- 如果发生更新的位置大于或等于原来的位置，说明这个 Fiber 就是最后一个可复用 Fiber，返回这个 Fiber 的位置



<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2023-02-28-082152.png" alt="image-20230228162152734" style="zoom:50%;" />	



下面是 *plceChild* 函数

```js
  function placeChild(
    newFiber: Fiber,
    lastPlacedIndex: number,
    newIndex: number,
  ): number {
    newFiber.index = newIndex;
    if (!shouldTrackSideEffects) {
      // During hydration, the useId algorithm needs to know which fibers are
      // part of a list of children (arrays, iterators).
      newFiber.flags |= Forked;
      return lastPlacedIndex;
    }
        
    const current = newFiber.alternate;

    // 如果 alternate 不为 null，说明这是一个更新操作
    if (current !== null) {
      const oldIndex = current.index;
      // 当前发生更新的位置小于最后一个可复用 Fiber 的位置，说明这是一个移动操作
      if (oldIndex < lastPlacedIndex) {
        // This is a move.
        newFiber.flags |= Placement | PlacementDEV;
        return lastPlacedIndex;
      }
      // 当前发生更新的位置不小于最后一个可复用 Fiber 的位置，发生更新的元素没有移动，位置保持不变
      else {
        // This item can stay in place.
        return oldIndex;
      }
    }
    // 如果 alternate 为 null，说明这是一个插入操作
    else {
      // This is an insertion.
      newFiber.flags |= Placement | PlacementDEV;
      return lastPlacedIndex;
    }
  }
```



​	



下面是多节点 diff 的核心逻辑

```js
  /**
   * react diff 的核心
   *
   * @param {*} returnFiber 当前 Fiber 节点的父节点
   * @param {*} currentFirstChild 当前执行更新任务的 Fiber 节点
   * @param {*} newChildren 新的 React 元素数组
   * @param {*} lanes
   * @returns
   */
  function reconcileChildrenArray(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChildren: Array<any>,
    lanes: Lanes,
  ): Fiber | null {
    // 下面这段话介绍了为什么React不使用双端diff算法
    // 一绝话总结就是：双端diff有从后往前遍历的过程，而 FiberTree 使用的是链表结构，没有反向指针，只能通过 sibling 从前往后遍历

    // This algorithm can't optimize by searching from both ends since we
    // don't have backpointers on fibers. I'm trying to see how far we can get
    // with that model. If it ends up not being worth the tradeoffs, we can
    // add it later.

    // Even with a two ended optimization, we'd want to optimize for the case
    // where there are few changes and brute force the comparison instead of
    // going for the Map. It'd like to explore hitting that path first in
    // forward-only mode and only go for the Map once we notice that we need
    // lots of look ahead. This doesn't handle reversal as well as two ended
    // search but that's unusual. Besides, for the two ended optimization to
    // work on Iterables, we'd need to copy the whole set.

    // In this first iteration, we'll just live with hitting the bad case
    // (adding everything to a Map) in for every insert/move.

    // If you change this code, also update reconcileChildrenIterator() which
    // uses the same algorithm.

    let knownKeys: Set<string> | null = null;

    let resultingFirstChild: Fiber | null = null;
    let previousNewFiber: Fiber | null = null;

    let oldFiber = currentFirstChild;
    let lastPlacedIndex = 0;  // 记录最后一个可复用节点在 currentFiberNode 中的位置
    let newIdx = 0;
    let nextOldFiber = null;

    // 第一次遍历
    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
      if (oldFiber.index > newIdx) {
        nextOldFiber = oldFiber;
        oldFiber = null;
      } else {
        nextOldFiber = oldFiber.sibling;
      }

      /**
       * 这个函数的作用：
       * 1. 判断新节点是否是 object 类型，如果不是，例如 string 和 number，则直接更新节点
       * 2. 如果节点的类型是 object 且不为 null，会开始判断 key 和 type
       *    1. 如果key相同，继续判断 type 是否相同
       *        1. type相同：复用 fiber
       *        2. type不同：根据 ReactElement创建一个全新的Fiber
       *    2. 返回复用的或者创建 Fiber
       */
      const newFiber = updateSlot(
        returnFiber,
        oldFiber,
        newChildren[newIdx],
        lanes,
      );

      // 如果上面返回的 Fiber 为null，说明 key 不同，则直接跳出循环
      if (newFiber === null) {
        // TODO: This breaks on empty slots like null children. That's
        // unfortunate because it triggers the slow path all the time. We need
        // a better way to communicate whether this was a miss or null,
        // boolean, undefined, etc.
        if (oldFiber === null) {
          oldFiber = nextOldFiber;
        }
        break;
      }

      if (__DEV__) {
        knownKeys = warnOnInvalidKey(
          returnFiber,
          newFiber,
          newChildren[newIdx],
          knownKeys,
        );
      }

      if (shouldTrackSideEffects) {
        if (oldFiber && newFiber.alternate === null) {
          // We matched the slot, but we didn't reuse the existing fiber, so we
          // need to delete the existing child.
          // key 相同但 type 不同的情况，创建了新的 Fiber，此时旧的 Fiber 就要放到一个 deletions 数组中，等待统一删除
          deleteChild(returnFiber, oldFiber);
        }
      }

      // 在第一次遍历中，不会有移动操作，所以返回的是 newFiber.alternate.index
      // 也就是 currentFiberNode 中对应的 Fiber 的索引
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);

      if (previousNewFiber === null) {
        // TODO: Move out of the loop. This only happens for the first run.
        resultingFirstChild = newFiber;
      } else {
        // TODO: Defer siblings if we're not at the right index for this slot.
        // I.e. if we had null values before, then we want to defer this
        // for each null value. However, we also don't want to call updateSlot
        // with the previous one.
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
      oldFiber = nextOldFiber;
    }

    // 第一次遍历结束了，结束的原因可以是 newChild 遍历完了，也可以是 oldFiber.key !== newChild.key
    // 那么就存在以下三种情况

    // 第一种情况：newChildren 遍历完了，oldFiber 没遍历完
    // 说明剩下的 oldFiber 都是要删除的，那么遍历剩下的 oldFiber 并删除它们
    if (newIdx === newChildren.length) {
      // We've reached the end of the new children. We can delete the rest.
      deleteRemainingChildren(returnFiber, oldFiber);
      if (getIsHydrating()) {
        const numberOfForks = newIdx;
        pushTreeFork(returnFiber, numberOfForks);
      }
      return resultingFirstChild;
    }

    // 第二种情况：newChildren 没遍历完，oldFiber 遍历完了
    // 说明 newChildren 中剩下的全是要新建的
    // 只需要为每个 ReactElement 创建新的 Fiber
    // 并标记当前 lastPlacedIndex
    if (oldFiber === null) {
      // If we don't have any more existing children we can choose a fast path
      // since the rest will all be insertions.
      for (; newIdx < newChildren.length; newIdx++) {
        const newFiber = createChild(returnFiber, newChildren[newIdx], lanes);
        if (newFiber === null) {
          continue;
        }
        if (__DEV__) {
          knownKeys = warnOnInvalidKey(
            returnFiber,
            newFiber,
            newChildren[newIdx],
            knownKeys,
          );
        }

        // 在当前对剩余 newChildren 的遍历中，不会有移动操作，所以返回的是 newFiber.alternate.index
        // 也就是 currentFiberNode 中对应的 Fiber 的索引
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
        if (previousNewFiber === null) {
          // TODO: Move out of the loop. This only happens for the first run.
          resultingFirstChild = newFiber;
        } else {
          previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
      }
      if (getIsHydrating()) {
        const numberOfForks = newIdx;
        pushTreeFork(returnFiber, numberOfForks);
      }
      return resultingFirstChild;
    }

    // 第三种情况：newChildren 和 oldFiber 都没遍历完
    // 使用 Map 保存 oldFiber
    // 键是 Fiber 的 key 或 index
    // 值是 Fiber 本身
    const existingChildren = mapRemainingChildren(oldFiber);

    // 那么此时就要进入第二次遍历，遍历剩余的 newChildren，从 existingChildren 中寻找能复用的
    // Keep scanning and use the map to restore deleted items as moves.
    for (; newIdx < newChildren.length; newIdx++) {
      // 根据 updateFormMap 返回的结果判断当前 newChildren 能否在 existingChildren 中找到能复用的
      const newFiber = updateFromMap(
        existingChildren,
        returnFiber,
        newIdx,
        newChildren[newIdx],
        lanes,
      );
      if (newFiber !== null) {
        if (__DEV__) {
          knownKeys = warnOnInvalidKey(
            returnFiber,
            newFiber,
            newChildren[newIdx],
            knownKeys,
          );
        }
        if (shouldTrackSideEffects) {
          if (newFiber.alternate !== null) {
            // The new fiber is a work in progress, but if there exists a
            // current, that means that we reused the fiber. We need to delete
            // it from the child list so that we don't add it to the deletion
            // list.
            // 如果找到能复用的，那么直接从 existingChildren 中删除，而不是添加到 deletions 中
            existingChildren.delete(
              newFiber.key === null ? newIdx : newFiber.key,
            );
          }
        }
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
        if (previousNewFiber === null) {
          resultingFirstChild = newFiber;
        } else {
          previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
      }
    }

    if (shouldTrackSideEffects) {
      // Any existing children that weren't consumed above were deleted. We need
      // to add them to the deletion list.
      existingChildren.forEach(child => deleteChild(returnFiber, child));
    }

    if (getIsHydrating()) {
      const numberOfForks = newIdx;
      pushTreeFork(returnFiber, numberOfForks);
    }
    return resultingFirstChild;
  }
```

