import { defineConfig } from 'vitepress'
import sidebarConfig from './sidebar.config'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'frontend note of jiahe',
  description: 'A VitePress Site',
  srcDir: 'src',
  themeConfig: {
    logo: '/logo.jpg',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/index' },
      {
        text: '渡一高薪课',
        link: '/渡一高薪课/开始',
      },
    ],

    sidebar: sidebarConfig.themeConfig.sidebar,
    // sidebar: [
    //   {
    //     text: '渡一高薪课',
    //     collapsed: true,
    //     items: [
    //       {
    //         text: 'Webpack',
    //         link: '/渡一高薪课/Webpack',
    //       },
    //     ],
    //   },
    // ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/littleJH' }],
  },
  ignoreDeadLinks: true,
  markdown: {
    theme: {
      dark: 'one-dark-pro',
      light: 'one-light',
    },
  },
})
