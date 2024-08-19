# Webpack

---

这一章的重点在于：webpack核心功能（构建流程、加载器 loader、插件 plugin） 和 性能优化！



## 构建流程

---



### 一、初始化

> 将 *CLI参数*，*配置文件*，*默认配置*，合并成最终的配置对象。



### 二、编译



#### 1. 创建 `chunk`

> 表示通过某个入口找到的所有依赖的统称。

每个 `chunk` 都有两个属性：

- `name`：就是在配置中，每个 entry 的 key 值，在下面就是 main 和 other

  ```javascript
  module.exports = {
      entry: {
          main: "./src/index.js",
          other: './src/other.js'
      }
  }
  ```

  

- `id`：唯一编号，在开发环境跟 name 相同，在生产环境是从 0 开始的编号

根据每个入口文件创建各自的 `chunk`，每个 `chunk` 都是独立的模块，构建依赖的过程是隔离的。





#### 2. 构建依赖

> 在这个阶段开始，对每个 `chunk ` 递归地构建所有依赖。



##### 步骤

在构建的初期，会创建一个模块记录表，用于记录已经加载过的模块

| 模块 id        | 转换后的代码                              |
| -------------- | :---------------------------------------- |
| ./src/index.js | 这里是后面第 6 对代码进行转换后保存的位置 |
| ./src/other.js | 同上                                      |

1. 找到模块文件入口

2. 读取表格，如果模块被加载过，直接跳过

3. 读取文件内容

4. 执行 `loader` 函数

5. 构建抽象语法树

6. 遍历 AST，收集所有依赖的模块，用一个队列保存，`const dependencies = ["./src/index.js", "./src/other.js", ...]   ` 

7. 对代码进行转换

   ```javascript
   require ==> __webpack_require
   ```

8. 根据 `dependencies` 中记录的依赖，递归地加载模块

注意：以上整个构建过程在每个 `chunk` 中都会同样地执行

![image-20240814201450079](https://raw.githubusercontent.com/littleJH/PicBed/main/img/image-20240814201450079.png)	



#### 3. 创建 `chunk assets` 

根据模块记录表生成最终的 `chunk assets`，可以理解为最终要输出的文件资源

每一个 `chunk` 都有一个对应  `chunkhash` ，是根据整个 `chunk assets` 的内容生成的哈希值

注意：最终生成的资源可能不止一个文件，例如配置了 `devtool: source-map`，就会另外生成一个`xxx.map.js`文件

​	![](https://raw.githubusercontent.com/littleJH/PicBed/main/img/image-20240814201932832.png)



##### 4. 合并 `chunk assets`

将所有 `chunk assets` 合并，这是最重要输出到 `output` 配置的目录中的文件资源，同时会生成一个总的 `hash`

![](https://raw.githubusercontent.com/littleJH/PicBed/main/img/image-20240814202429136.png)	





### 三、输出

通过 nodejs 的 fs 模块写入文件

![](https://raw.githubusercontent.com/littleJH/PicBed/main/img/image-20240814202703268.png)	







总过程

![](https://raw.githubusercontent.com/littleJH/PicBed/main/img/image-20240814201251288.png)





## 编译结果分析

---



### 模拟打包结果

关键点：

- 立即执行函数
- 实现 `require` 函数
- 维护 module 对象
- 实现模块缓存

 ```js
 /**
  * 模拟 webpack 打包结果
  */
 
 ;(function (modules, entry = './src/index.js') {
   // require 函数，调用它相当于运行模块，得到导出的对象
   function require(moduleId) {
     const func = modules[moduleId] // 得到模块对应的函数
     // 用于保存导出的结果
     const module = {
       exports: {},
     }
     // 运行模块代码
     func(module, module.exports, require)
   }
   // 根据 entry 入口开始执行，递归调用
   require(entry)
 })({
   // 该对象保存了所有模块，以及模块对应的代码，在函数环境中运行
   './src/index.js': function (module, exports, require) {
     console.log('module index')
     const a = require('./src/a.js')
   },
   './src/a.js': function (module, exports, require) {
     console.log('module a')
     module.exports = {
       a: 'aaa',
     }
     const b = require('./src/b.js')
   },
   './src/b.js': function (module, exports, require) {
     console.log('module b')
     module.exports = {
       b: 'bbb',
     }
   },
 })
 
 ```





## 加载器 loader

> loader 就是一个函数，用于将一段代码转换为另一段代码，本之上是对字符串的转换。



执行时机：模块解析中，读取文件内容之后，构建抽象语法树之前。

多个 loader 的执行顺序：从下到上，从右到左

```javascript
{
    module: {
        loaders: [
            {
                test: reg1,// 正则表达式，匹配需要转换的文件类型
                use: ['first-loader', 'second-loader'] // 从右到左执行
            },
            {
                test: reg2,
                use: [
                    {
                        loader: 'third-loader',
                        options: {
                            ...
                        }
                    }
                ]
            }	// 从下到上执行
        ]
    }
}
```

**处理 loaders 流程：**

![](https://raw.githubusercontent.com/littleJH/PicBed/main/img/image-20240814205718147.png)	







## 插件 plugin

> 插件是一个拥有 `apply` 方法的构造函数，是对整个构建流程各个节点的事件进行监听，并各个功能嵌入到各个节点中。





## 性能优化

---

> 性能优化分为三个模块：构建性能、传输性能、运行性能
>
> 不要过早地进行优化，优先考虑代码的可维护性和可阅读性，当出现问题时再思考如何解决



### 减少模块解析（构建）

- noParse

  > 不解析某模块，适用于没有依赖的模块，例如已经打包好的第三方库（jquery, lodash）

  

  不解析会怎样？

  跳过构建依赖中的一些步骤：

  - 抽象语法树分析
  - 构建依赖数组
  - 代码转换

  ```js
  {
      module: {
          noParse: /(jquery)|(lodash)/
      }
  }
  ```

  

### 优化 loader 性能（构建）

- exclude

  > loader 的配置项，不对某模块进行 loader，适用于不需要转换的模块

  例如：对于 `babel-loader`，一些第三方库（例如 lodash）已经做了版本兼容，不需要再次进行 Babel 转换。

  ```js
  {
      module {
          rules: [
              {
                  test: /\.js$/,
                  exclude: /lodash/,
                  use: 'babel-loader'
              }
          ]
      }
  }
  ```

  

- cache-loader

  > 对 loader 的结果进行缓存。如果模块内容没有变化，那么loader转换的结果一定是没有变化的。

  

  缓存位置：Windows的临时目录，也可以保存到指定的真实目录

  

  **配置示例：**

  ```js
{
      module: {
          rules: [
              {
                  test: /\.js$/,
                  use: [
                      {
                          loader: 'cache-loader',
                          options: {
                              cacheDirectory: 'cache'  // 指定缓存保存的真实目录
                          }
                      },
                      ...otherloaders
                  ]
              }
          ]
      }
  }
  ```
  
  

  

  为什么 `cache-loader` 放在最前面，却能够决定其它loader 的执行与否？

  > 在 loader 的运行过程中，还有另外一个机制： `pitch`

  ```js
module.exports = function myloader (source) {
      return `module.exports = ${source}`
  }
  
  // 创建 loader 函数的原型方法 picth，其是否有返回决定了其它loader的执行与否
  module.exports.pitch = function (filePath) {	// 接收一个参数，filePath
      // 如果这里有返回，那么直接执行这个 loader 的主函数，也就是 myloader 函数
      // 如果这里里没有任何返回，那么其它 loader 得以执行
  } 
  ```
  
  

  **`pitch` 的运行机制：**

  

  ![](https://raw.githubusercontent.com/littleJH/PicBed/main/img/image-20240815104444002.png)	

  

  

- thread-loader

  > 为后面的 loader 开启适量的线程，进行多线程执行，默认情况下，线程的数量由 CUP 核心的数量决定

  



### 热替换 HMR（构建）

[Webpack HMR 原理解析（知乎）](https://zhuanlan.zhihu.com/p/30669007)



### 手动分包（传输）

在开发阶段是不需要分包的，分包的根本目的是**提高传输性能**！





### 自动分包（传输）

> - 不同于手动分包，自动分包是从**宏观层面**考虑的，不具体到每一个包
> - 重点是 **分包策略**，`webpack` 会按照策略自动分包，它实际上使用的是 webpack 内部插件 `SplitChunksPlugin`去完成的



#### 分包流程

- 每个 `chunk` 都会维护一个 *模块记录表*，webpage 会在这些表中寻找重复的模块，从而提取公共代码
- 分包时，webpack 会开启一个新的 `chunk`，对提取的模块单独打包
- 将分离出来的模块从原 `chunk` 中移除，并修正原始包代码

注意：分包的基本单位是模块，所以即使设置了 `maxSize` 小于模块的大小，实际上模块的大小也有可能超过 `maxSize`！



#### 基本配置

```js
{
    // 翻译：优化
    optimization: {
        splitChunks: {
            chunks: 'all', 	// 对所有chunk都应用分包
            maxSize: 100 * 1024, // 包的最大字节数，包的大小是有可能超过这个数的,
            cacheGroups: {		// 缓存组
                                
            }
        }
    }
}
```



#### 分包结果

- 在分离的代码中，模块以数组的形式注入到 **全局变量** 中

  例如：一下是对某 css 的分包打包结果

  ```js
  (self["webpackChunkwebpack"] = self["webpackChunkwebpack"] || []).push([["style"],{
  
  /***/ "./src/tosplit/index.css":
  /*!*******************************!*\
    !*** ./src/tosplit/index.css ***!
    \*******************************/
  /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
  
  eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://webpack/./src/tosplit/index.css?");
  
  /***/ })
  
  }]);
  ```

  

- 如何使用？

  在 `mian.bundle.js` 中，通过 `__webpack_require__` 方法引入模块

  ```js
  var _index_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./index.css */ \"./src/tosplit/index.css\")
  ```







### 代码压缩（传输）

> 移除模块内的、不会产生副作用的无效代码 



单模块体积压缩，可以和分包结合使用，webpack 生产环境默认开启，使用的工具是 `terser`



###  tree-shaking（**传输）important！**

> 移除模块之间的、不会产生副作用的无效代码 



单模块体积压缩，可以和分包结合使用，webpack 生产环境默认开启



#### 原理

> webpack会从入口模块出发寻找依赖关系，当解析一个模块时，webpack会根据ES6的模块导入语句来判断，该模块依赖了另一个模块的哪个导出



**语法层面：**

webpack 的 `tree-shaking` 使用 ESM 静态导入导出语法，这种语法有以下特点

- 只能在顶层导入导出，不能在函数中或者条件判断中使用
- 导入的路径只能是字符串（`require` 的路径可以是变量，因为 `require` 本质上不过是函数调用）
- import 所绑定的变量是不可变的，不能对其赋值或修改属性

这种规则十分有助于分析依赖关系



**注意点：**

1. 在导出时，使用 `export xxx` 而不是 `export default {}`

   因为

2. 在导入时，使用 `import {} from 'xxx'` 而不是 `import xxx from 'xxx'` 或 `import * as xxx from 'xxx'`



**原则：**

确保代码的正确运行，其次才是尽量 `tree-shaking`

因此：如果使用 `export default {}` 和 `import xxx from 'xxx'` 时，webpack 并不能保证导入对象中的某个属性是 `dead code`



以下代码中 ，`util.js` 默认导出了一个对象。虽然在 `index.js` 中没有调用 `obj.sub` 方法，但是在当前模块内，并不能保证 `obj.sub` 方法没有用，例如整个 `obj` 对象作为函数的参数被使用

```js
// util.js
export default {
  add: function add(a, b) {
    console.log("add");
    return a + b;
  },
  sub: function sub(a, b) {
    console.log("sub");
    return a - b;
  }
};


// index.js
import obj from 'util.js'
obj.add()	

```

而如果使用  `export xxx`  和 ``import {} from 'xxx'`，没有导入当然也不存在被使用的可能



其实，`tree-shaking` 做的也不过是找出未使用的模块导出并标记为 `dead code`，真正删除代码的动作还是要交给压缩工具，例如 `terser`



#### 若干问题



##### 1. 第三方库没有使用 ESM

对于一些第三库其为了跨平台性，一般使用的是 `commenjs`，`tree-shaking` 是无法发挥作用的

那我们只能寻找其 `es` 版本咯，例如 `lodash` 就有对应的 `lodash-es`



##### 2. 作用域问题

在 `webpack v4` 中，如果嵌套的层级过深，比如在函数作用域中，webpack 就有点无能为力了

以下代码中，虽然 `a.js` 中的 `isArr` 实际上并没有被导入，但是 `tree-shaking` 无法根据依赖关系确定这是 `dead code`

```js
// a.js
import { isArray } from 'lodash-es'

export function isArr (arr) {
    return isArray(arr)
}

export function fn () {
    console.log('fn')
}

// index.js
import { fn } from 'a.js'
fn()

```

解决方法：`webpack-deep-scope-plugin` 插件，可以解决深层作用域中的依赖关系问题

`webpack v5` 有没有解决这个问题呢 ？？？



##### 3. 副作用问题

由于 JS 的动态性，压缩工具往往无法确定某个语句或模块是没有副作用的

`lodash` 就是典型的没有副作用的模块，如果我们在代码中导入了 `lodash` 但是没有使用它的方法，那么 `lodash` 对于当前模块来说就是无效代码 `dead code`

对于确实没有副作用的语句或模块，可以使用以下解决方案

- 语句：使用 `/*#__PURE__*/` 标记为纯净的
- 模块：在 `package.json` 中配置`sidrEffects`，是一个字符串或数组，用于描述没有副作用的模块文件



##### 4. CSS tree-shaking

webpack 无法对 CSS `tree-shaking`，因为 CSS 跟  ES 没有半毛钱关系

因此要靠其它插件来完成，例如：`purgecss-webpack-plugin`

它的实现方式简单粗暴，直接正则匹配某个样式是否被使用

因此，对于 `css module` ，它也无能为力，因为 css 样式会被编译成一堆哈希

示例配置：

```js
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const DeepScope = require("webpack-deep-scope-plugin").default;
const MiniCss = require("mini-css-extract-plugin");
const Purgecss = require("purgecss-webpack-plugin");
const path = require("path");
const globAll = require("glob-all");
const srcAbs = path.resolve(__dirname, "src"); //得到src的绝对路径
const htmlPath = path.resolve(__dirname, "public/index.html");
const paths = globAll.sync([`${srcAbs}**/*.js`, htmlPath]);

module.exports = {
  mode: "production",
  module: {
    rules: [{ test: /\.css$/, use: [MiniCss.loader, "css-loader"] }]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new DeepScope(),
    new MiniCss(),
    new Purgecss({
      paths
    })
  ]
};

```





### 懒加载（传输）

### ESLint

### bundle analizer

### gzip





## 扩展

### 多页应用

### `Vue` 单页应用

### `React` 单页应用

### `Node` 应用