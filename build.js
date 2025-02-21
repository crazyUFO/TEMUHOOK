const fs = require('fs');
const { minify } = require('terser');

const inputFile = 'main.js';
const outputFile = 'dist/main.min.js';

// 读取原始代码
const code = fs.readFileSync(inputFile, 'utf8');

// 使用正则表达式匹配元数据块
const metadataBlock = code.match(/\/\/ ==UserScript==[\s\S]*?\/\/ ==UserScript==/i);

if (!metadataBlock) {
  console.error('未找到元数据块');
  process.exit(1);
}

// 移除元数据块后的代码
const codeWithoutMetadata = code.replace(/\/\/ ==UserScript==[\s\S]*?\/\/ ==UserScript==/i, '');

// 使用 Terser 压缩剩余代码
minify(codeWithoutMetadata, {
  mangle: true, // 启用混淆
  compress: true, // 启用压缩
}).then((result) => {
  if (result.error) {
    console.error('压缩失败：', result.error);
    process.exit(1);
  }

  // 将元数据块和压缩后的代码拼接
  const finalCode = `${metadataBlock[0]}\n${result.code}`;

  // 写入输出文件
  fs.writeFileSync(outputFile, finalCode, 'utf8');
  console.log('构建完成！');
});