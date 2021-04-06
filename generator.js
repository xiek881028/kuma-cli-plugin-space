const fs = require('fs-extra');
const path = require('path');
const minimist = require('minimist');
const inquirer = require('inquirer');
const type = require('./src/type').default;

module.exports = async (api, options, invoking) => {
  const { fast, del } = minimist(process.argv.slice(4));
  const cwd = api.resolve('.');
  const hookPath = path.join(cwd, '.git/hooks', 'pre-commit');

  if (del) {
    fs.removeSync(hookPath);
    api.logger.done('插件删除成功');
    api.logger.warn('请记得手动删除 package.json 中相关配置项');
    return;
  }

  let overwrite = false;
  const exist = fs.existsSync(hookPath);
  if (exist) {
    overwrite = (
      await inquirer.prompt([
        {
          name: 'overwrite',
          type: 'confirm',
          message: 'git commit hook 已存在，是否覆写？',
        },
      ])
    ).overwrite;
  }

  if (!exist || overwrite) {
    if (!api.hasProjectGit(cwd)) {
      api.logger.error('项目内未找到git，请初始化后再运行插件');
    } else {
      // 暂时不用 husky，启动太慢了。。。有问题再说
      fs.copyFileSync(path.join(__dirname, 'src', fast ? 'fast/' : '', 'pre-commit'), hookPath);
      api.extendPackage({
        kumaPrettier: {},
        kumaPrettierFile: type,
      });
      api.logger.done('插件安装成功，正常提交代码即可');
    }
  }
};
