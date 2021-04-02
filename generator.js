const fs = require('fs-extra');
const path = require('path');
const minimist = require('minimist');

module.exports = async (api, options, invoking) => {
  const { fast, del } = minimist(process.argv.slice(4));
  const cwd = api.resolve('.');

  if (del) {
    console.log('cwd: ', cwd);
    fs.removeSync(path.join(cwd, '.git/hooks', 'pre-commit'));
    api.logger.done('插件删除成功');
    return;
  }
  if (!api.hasProjectGit(cwd)) {
    api.logger.error('项目内未找到git，请初始化后再运行插件');
  } else {
    // 暂时不用 husky，启动太慢了。。。有问题再说
    fs.copyFileSync(
      path.join(__dirname, 'src', fast ? 'fast/' : '', 'pre-commit'),
      path.join(cwd, '.git/hooks', 'pre-commit')
    );
    api.logger.done('插件安装成功，正常提交代码即可');
  }
};
