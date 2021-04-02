#!/usr/bin/env node

/**
 * @file space核心方法
 * @author xiek(285985285@qq.com)
 */

const fs = require('fs-extra');
const minimist = require('minimist');
const prettier = require('prettier');
const pkgDir = require('pkg-dir');
const path = require('path');
const types = require('../type').default;

(async () => {
  let now = Date.parse(new Date());
  console.info(`开始使用 gitPrettier 美化代码`);
  console.log();
  const root = await pkgDir.sync();
  if (root === null) throw Error('未找到package.json，请在工程里运行插件');
  const pkg = fs.readJsonSync(path.join(root, 'package.json'));
  const opsPath = prettier.resolveConfigFile.sync();
  const prettierOps = (opsPath === null ? {} : prettier.resolveConfig.sync(opsPath)) ?? {};
  const caihOps = pkg.gitPrettier ?? {};
  const ops = {
    ...prettierOps,
    ...caihOps,
  };
  const { diff, first } = minimist(process.argv.slice(2));
  let change = [];
  if (first.trim()) {
    const fileList = first.split(/\r?\n/g);
    let hasOther = false;
    for (let i = 0; i < fileList.length; i++) {
      const [mode, name] = fileList[i].split(/\s+/);
      if (mode !== 'A') hasOther = true;
      change.push(name);
    }
    if (hasOther) {
      console.error(`未找到修改文件，是否忘记运行git add ？`);
      process.exit(1);
    }
  } else {
    change = diff.split(/\r?\n/g);
  }
  for (let i = 0; i < change.length; i++) {
    const el = change[i];
    if (types.has(path.extname(el)) && fs.existsSync(el)) {
      const format = prettier.format(fs.readFileSync(el, { encoding: 'utf8' }), {
        ...ops,
        filepath: el,
      });
      fs.writeFileSync(el, format, { encoding: 'utf8' });
    }
  }
  console.log(`代码美完成    `, `${Date.parse(new Date()) - now}ms`);
})();
