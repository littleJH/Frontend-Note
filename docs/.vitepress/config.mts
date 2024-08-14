import { defineConfig } from 'vitepress'
import sidebarConfig from './sidebar.config'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "frontend note of jiahe",
  description: "A VitePress Site",
  srcDir: 'src',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: '渡一课程', link: '/渡一课程' }
    ],

    sidebar: sidebarConfig.themeConfig.sidebar,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/littleJH' }
    ],

  },
  ignoreDeadLinks: true
})
