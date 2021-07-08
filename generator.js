const fs = require('fs-extra');
const path = require('path');
const minimist = require('minimist');
const inquirer = require('inquirer');
const execa = require('execa');
const type = require('./src/type').default;

module.exports = async (api, options, invoking) => {
  const { fast, del } = minimist(process.argv.slice(4));
  const cwd = api.resolve('.');
  let relativePath = '';
  let gitPath = '';
  try {
    const { stdout } = execa.sync(
      'git',
      ['rev-parse', '--show-toplevel'],
      {
        cwd,
      }
    );
    gitPath = stdout;
    relativePath = path.relative(stdout, cwd);
  } catch (error) {
    api.logger.error('项目内未找到git，请初始化后再运行插件');
    return;
  }
  const hookPath = path.join(gitPath, '.git/hooks', 'pre-commit');

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
      // 暂时不用 husky，在加密软件下启动太慢了。。。有问题再说
      let preCommit = fs.readFileSync(path.join(__dirname, 'src', fast ? 'fast/' : '', 'pre-commit'), { encoding: 'utf8' }).replace('#relativePath#', (path.join(relativePath, 'node_modules/kuma-cli-plugin-space/src', fast ? 'fast/index.js' : 'index.js')).replace(/\\/g, '\\\\'));
      preCommit = preCommit.replace('#packagePath#', relativePath.replace(/\\/g, '\\\\'));
      fs.writeFileSync(hookPath, preCommit, { encoding: 'utf8' });
      api.extendPackage({
        kumaPrettier: {},
        kumaPrettierFile: type,
      });
      api.logger.done('插件安装成功，正常提交代码即可');
    }
  }
};
