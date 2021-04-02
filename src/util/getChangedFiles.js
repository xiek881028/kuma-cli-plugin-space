const { hasProjectGit } = require('./env');
const execa = require('execa');

module.exports = async function getChangedFiles(context, hasDel = true) {
  if (!hasProjectGit(context)) return [];

  try {
    const { stdout } = execa.sync(
      'git',
      ['diff', '--name-only', 'HEAD', '--cached'].concat(hasDel ? ['--diff-filter=d'] : []),
      {
        cwd: context,
      }
    );
    if (stdout.trim()) {
      return stdout.split(/\r?\n/g);
    }
  } catch (error) {
    // 判断是否是因为首次提交导致无HEAD的情况
    const { stdout } = execa.sync('git', ['status', '--porcelain=v1'], {
      cwd: context,
    });
    if (stdout.trim()) {
      const fileList = stdout.split(/\r?\n/g);
      let hasOther = false;
      const out = [];
      for (let i = 0; i < fileList.length; i++) {
        const [mode, name] = fileList[i].split(/\s+/);
        if (mode !== 'A') hasOther = true;
        out.push(name);
      }
      if (hasOther) {
        console.error(`未找到修改文件，是否忘记运行git add ？`);
        process.exit(1);
      } else {
        return out;
      }
    }
  }
  return [];
};
