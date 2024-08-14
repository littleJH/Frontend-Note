const { Client } = require('@notionhq/client');
const { NotionToMarkdown } = require('notion-to-md');
const fs = require('fs');
const path = require('path');

// 初始化 Notion 客户端
const secret = 'secret_5GT0BcTfoH6oI0EE9kScoFwFLEwUkiF0god0rbUb8yu'
const notion = new Client({ auth: secret, timeoutMs: 100000 });
const n2m = new NotionToMarkdown({
  notionClient: notion, config: {
    separateChildPage: true,
    convertImagesToBase64: true
  }
});

// 获取页面标题
async function getPageTitle(pageId) {
  const page = await notion.pages.retrieve({ page_id: pageId });
  const titleProperty = page.properties.title || page.properties.Name;
  if (titleProperty && titleProperty.title) {
    return titleProperty.title.map(part => part.plain_text).join('');
  }
  return 'Untitled';
}
// 更新 Markdown 中的链接
function updateLinks(mdString, idToTitleMap) {
  return mdString.replace(/\[(.*?)\]\((.*?)\)/g, (match, text, link) => {
    const pageId = link.split('/').pop(); // 假设链接中包含页面ID
    const title = idToTitleMap[pageId];
    if (title) {
      return `[${text}](${title}.md)`;
    }
    return match;
  });
}

function insertSubPage(mdString) {
  return mdString
}

// 递归获取页面和子页面
async function exportPageToMarkdown(pageId, outputDir, idToTitleMap) {
  const title = await getPageTitle(pageId);
  idToTitleMap[pageId] = title; // 添加到映射

  const pageDir = path.join(outputDir, `${title}`);
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }

  const mdblocks = await n2m.pageToMarkdown(pageId);
  let mdString = n2m.toMarkdownString(mdblocks)?.parent || '';
  console.log("🚀 ~ exportPageToMarkdown ~ mdString:", n2m.toMarkdownString(mdblocks))

  // 更新 Markdown 中的链接
  mdString = updateLinks(mdString, idToTitleMap);

  const filePath = path.join(pageDir, `${title}.md`);
  fs.writeFileSync(filePath, mdString, 'utf8');

  console.log(`页面已导出到: ${filePath}`);

  const children = await notion.blocks.children.list({ block_id: pageId });

  for (const child of children.results) {
    if (child.type === 'child_page') {
      await exportPageToMarkdown(child.id, pageDir, idToTitleMap);
    }
  }
}


(async () => {
  const rootPageIds = ['392b43c3320746a1b6f85c5ed028e6bc'];
  const outputDirectory = './notion-pages';
  const idToTitleMap = {};
  fs.rmSync(outputDirectory, { recursive: true });
  fs.mkdirSync(outputDirectory, { recursive: true });

  for (const id of rootPageIds) {
    await exportPageToMarkdown(id, outputDirectory, idToTitleMap);
  }
})()
