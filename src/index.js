#!/usr/bin/env node

/**
 * @file space核心方法
 * @author xiek(285985285@qq.com)
 */

let now = Date.parse(new Date());
let start = now;
const fs = require('fs-extra');
const prettier = require('prettier');
const pkgDir = require('pkg-dir');
const ignore = require('ignore');
const path = require('path');
const execa = require('execa');
const getChangedFiles = require('./util/getChangedFiles');

const log = text => {
  console.log(`${text}    `, `${Date.parse(new Date()) - now}ms`);
  now = Date.parse(new Date());
};

(async () => {
  console.info(`开始使用 kumaPrettier 美化代码`);
  const root = await pkgDir.sync();
  if (root === null) throw Error('未找到package.json，请在工程里运行插件');
  const pkg = fs.readJsonSync(path.join(root, 'package.json'));
  const opsPath = prettier.resolveConfigFile.sync();
  const prettierOps = (opsPath === null ? {} : prettier.resolveConfig.sync(opsPath)) ?? {};
  const caihOps = pkg.kumaPrettier ?? {};
  const ops = {
    ...prettierOps,
    ...caihOps,
  };
  const ig = ignore().add(pkg.kumaPrettierFile ?? []);
  const change = await getChangedFiles(root);
  if (change.length) {
    for (let i = 0; i < change.length; i++) {
      const el = change[i];
      if (ig.ignores(el) && fs.existsSync(el)) {
        const format = prettier.format(fs.readFileSync(el, { encoding: 'utf8' }), {
          ...ops,
          filepath: el,
        });
        fs.writeFileSync(el, format, { encoding: 'utf8' });
      }
    }
    log('代码美化完成');
    try {
      await execa('git', ['add'].concat(change), { cwd: root });
    } catch (error) {
      console.error('git add失败，请手动尝试');
    }
    log('重新提交美化后代码完成');
    const nextChange = await getChangedFiles(root);
    const changeNoDel = await getChangedFiles(root, false);
    const delSet = new Set(changeNoDel);
    const merge = [];
    for (let i = 0; i < change.length; i++) {
      if (delSet.has(change[i])) {
        merge.push(change[i]);
      }
    }
    log('美化改动复查完成');
    if (!nextChange.length && !merge.length) {
      console.info(`美化后代码无改动，阻止 commit`);
      console.log(`总用时    `, `${Date.parse(new Date()) - start}ms`);
      process.exit(1);
    }
    console.info(`满足条件，开始 commit`);
  }
  console.log(`总用时    `, `${Date.parse(new Date()) - start}ms`);
})();
