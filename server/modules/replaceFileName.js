const path = require('node:path');
const fs = require('node:fs').promises;

const targetDir = 'D:/xxx/xxx';

const reg = /^ignore__/;
async function searchFiles() {
  // 已经存在的文件
  const existFiles = new Set();
  const files = (await fs.readdir(targetDir)).filter((file) => !reg.test(file));
  for (const file of files) {
    const parentPath = path.join(targetDir, file);
    // 过滤文件
    const state = await fs.stat(parentPath);
    if (!state.isDirectory()) {
      existFiles.add(file);
      continue;
    }

    // 当文件夹内的文件只有一个，并且名字比文件夹的名字短时，将文件重命名并且提取出来，删除空文件夹
    const childFiles = await fs.readdir(parentPath);
    if (childFiles.length > 1) continue;

    const childFileName = childFiles[0];
    const ext = path.extname(childFileName);
    const parentFileName = file + ext;
    const newFileName = parentFileName.length > childFileName.length ? parentFileName : childFileName;
    // 移动并重命名文件
    await fs.rename(path.join(parentPath, childFileName), path.join(targetDir, newFileName));
    // 删除空文件夹
    await fs.rmdir(parentPath);
  }
}

async function main() {
  // 当前只做了一层判断，可以考虑递归处理
  await searchFiles();
}

main();
