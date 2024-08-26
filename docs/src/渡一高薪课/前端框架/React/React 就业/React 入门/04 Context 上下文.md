# Context

---



## 关键 *API*

- *React.createContext*：创建上下文对象，对象中包含 *Provider* 和 *Consumer* 组件
- 提供者 *Provider* 
- 消费者 *Consumer*
- *useContext*：读取和订阅 *context*



## 示例：主题切换

*themeContext.js*

```jsx
import React from "react"

const themeContext = React.createContext(theme.light)

themeContext.displayName = 'themeContext'

export const theme = { //主题颜色
  dark: { color: '#1890ff', background: '#1890ff', border: '1px solid blue', type: 'dark', },
  light: { color: '#fc4838', background: '#fc4838', border: '1px solid pink', type: 'light' }
}

export default themeContext
```

*App.jsx*

```jsx
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import themeContext from "./context/themeContext"
import Child from "./component/04 context/Child"

// App.jsx

function App() {
  const [themeState, setThemeState] = useState(theme.light)
  const { Provider } = themeContext

  return (
    <Provider value={{ themeState, setThemeState }}>
      <div className="App">
        <Child></Child>
      </div>
    </Provider>

  )
}

export default App
```

*Child.jsx*

```jsx
import React from 'react'
import themeContext from '../../context/themeContext'

export default function Child() {
  const {themeState} = React.useContext(themeContext)
  
  return (
    <div style={{...themeState}}>Child</div>
  )
}
```

*Header.jsx*

```jsx
import React from 'react'
import themeContext from '../../context/themeContext'
import theme from '../../context/themeContext'

export default function Header() {
  const {setThemeState} = React.useContext(themeContext)
  
  return (
    <select >
      <option onSelect={() => setThemeState(theme.dark)}>dark</option>
      <option onSelect={() => setThemeState(theme.light)}>light</option>
    </select>
  )
}
```





## 优化

