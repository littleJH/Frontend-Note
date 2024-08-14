const { exec } = require('child_process');

// 从命令行参数中获取文件名
const args = process.argv.slice(2);
const fileToRun = args[0];

if (!fileToRun) {
  console.error('Please provide a file to run as a command line argument.');
  process.exit(1);
}

// 函数：根据操作系统打开终端并运行文件
function openTerminalAndRun(command) {
  const platform = process.platform;

  if (platform === 'win32') {
    exec(`start cmd.exe /k "node ${command}"`);
  } else if (platform === 'darwin') {
    exec(`osascript -e 'tell application "Terminal" to do script "node ${command}"'`);
  } else if (platform === 'linux') {
    exec(`gnome-terminal -- bash -c "node ${command}; exec bash"`);
  } else {
    console.log('Unsupported platform');
  }
}

// 执行文件
openTerminalAndRun(fileToRun);
