# HTML+CSS 收官

# HTML

# CSS

## 零散的知识

`resize`：设置 `textarea` 被用户改变尺寸的行为

`button:disabled`：选择禁用状态的按钮

浮动 `float` 会导致高度坍塌

解决方案：在浮动元素的父元素应用 `clearFix`

```css
.clearFix::after {
	clear: "both";
}
```

`~` 选择器：选择当前元素后面的兄弟元素

`input:checked`：单选/多选被选中的元素

通过**定位**实现水平垂直居中

```css
.center {
      position: absolute;
      width: 400px;
      height: 400px;
      left: 50%;
      top: 50%;
      margin-left: -50%;
      margin-top: -50%;
    }
```

## 属性值的计算过程

1. 确定声明值
    1. 用户样式覆盖浏览器默认样式
2. 处理层叠冲突
    1. 比较重要性
    2. 比较特殊性
    3. 比较源次序
3. 属性继承
    1. 对于仍没有值的属性，继承父级属性值（一般来说，字体、颜色等才会被继承）
4. 使用默认值

## 伪类选择器

- link 未访问过的超链接
- visited 访问过的超链接
- hover
- checked 选中的表单元素
- disabled 被禁用的表单元素
- active 鼠标按下的元素
- ……