import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "frontend note of jiahe",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        items: [
          { text: '前端进阶', link: '/前端进阶/前端进阶 2538c7e94b2548f89b3c837415e065e5' }
        ]
      },{
        items: [
          { text: '渡一高薪课', link: '/渡一高薪课/渡一高薪课 392b43c3320746a1b6f85c5ed028e6bc' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/littleJH' }
    ],

  },
  ignoreDeadLinks: true
})
