# kuma-cli-plugin-space

[![996.icu](https://img.shields.io/badge/link-996.icu-red.svg)](https://996.icu)

kuma-bootstrap 插件，主要功能是在获取采用另一份[prettier](https://prettier.io/)配置格式化代码，以满足本地编辑的舒适度与代码提交的规范性。

## 安装

依赖`kuma-bootstrap`，需要配套安装使用。依赖`git`检查差异，在没有运行`git init`的环境无法运行。

```bash
# kuma-bootstrap建议全局安装
npm install -g kuma-bootstrap
npm install -g kuma-cli-plugin-space

# 完全js编写，更稳定但更慢
kuma add space
# bash与js混编，更快但兼容性测试不充分
kuma add space --fast
# 删除插件
kuma add space --del
```

## 使用

在`package.json`里配置`kumaPrettier`与`kumaPrettierFile`字段，`kumaPrettier`配置项与`prettier`一致。之后向平时一样使用`git`就好。

```json
// 提交美化配置，与prettier支持一致
"kumaPrettier": {
  "tabWidth": 4
},
// 需要美化的文件类型，使用语法与.gitignore一致
"kumaPrettierFile": {
  "*.js",
  "*.jsx",
  "*.tsx",
  "*.vue",
  "*.json",
  "*.css",
  "*.less",
  "*.scss",
  "*.html"
}
```

## 原理

利用`git`检查差异减少需要美化的文件。在`commit hook`期间运行`prettier`美化代码并再次检查差异。筛选出真正有改动需要提交的文件进行提交。

## 许可证（License）

[Anti-996 License](LICENSE)
