const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar')

// 读取目录并生成侧边栏数据
function generateSidebar(dir, baseDir = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries.map(entry => {
    const name = entry.name.replace(/\.md$/, '').replace(/[a-f0-9]{32}/, "").trim();

    if (entry.isDirectory()) {
      const result = {
        text: name,
        collapsed: true,
        items: generateSidebar(path.join(dir, entry.name), path.join(baseDir, entry.name))
      };
      fs.renameSync(path.join(dir, entry.name), path.join(dir, name));
      return result
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const result = {
        text: name,
        link: path.join('/', baseDir, entry.name.replace(/\.md$/, "")).replace(/\\/g, '/')
      };
      // 去除链接中的hash
      const data = fs.readFileSync(path.join(dir, entry.name), 'utf8');
      encodeURI(decodeURI(data).replace(/([a-f0-9]{32})/, "").trim())
      fs.writeFileSync(path.join(dir, entry.name), data)
      fs.renameSync(path.join(dir, entry.name), path.join(dir, name + '.md'));
      return result
    }
  }).filter(Boolean);
}

// 主函数
function main() {
  const docsDir = path.resolve(__dirname, 'docs/src');
  const sidebarData = generateSidebar(docsDir);

  const configContent = `
export default {
  themeConfig: {
    sidebar: ${JSON.stringify(sidebarData, null, 2)}
  }
}
`;

  fs.writeFileSync(path.resolve(__dirname, 'docs/.vitepress/sidebar.config.js'), configContent, 'utf8');
  console.log('Sidebar configuration has been generated.');
}

main();

// const watcher = chokidar.watch('docs/src', {
//   persistent: true,
//   ignoreInitial: true
// })

// watcher.on('add', main).on('change', main).on("unlink", main).on("addDir", main).on("unlinkDir", main)
// console.log('Watching for changes in the docs/src directory...');

