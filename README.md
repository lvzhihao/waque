# 瓦雀

> 双双瓦雀行书案，点点杨花入砚池。 —— 元 叶李《暮春即事》

瓦雀可以帮你把本地的文档（markdown）目录发布到语雀上。

如果你想要...

- 返璞归真，使用 markdown；
- 选择自己喜欢的编辑器；
- 把文档维护在 GitHub 上；

瓦雀是你居家旅行，编写文档的必备工具。

> 注：文档同步是单向的，同步的文档不能再在语雀上编辑

- [瓦雀](#%e7%93%a6%e9%9b%80)
  - [安装瓦雀](#%e5%ae%89%e8%a3%85%e7%93%a6%e9%9b%80)
  - [登录语雀](#%e7%99%bb%e5%bd%95%e8%af%ad%e9%9b%80)
  - [初始化配置](#%e5%88%9d%e5%a7%8b%e5%8c%96%e9%85%8d%e7%bd%ae)
  - [上传文档](#%e4%b8%8a%e4%bc%a0%e6%96%87%e6%a1%a3)
  - [从已有仓库导出文档](#%e4%bb%8e%e5%b7%b2%e6%9c%89%e4%bb%93%e5%ba%93%e5%af%bc%e5%87%ba%e6%96%87%e6%a1%a3)
  - [谁在使用](#%e8%b0%81%e5%9c%a8%e4%bd%bf%e7%94%a8)

## 安装瓦雀

```bash
$ npm i -g waque
```

## 登录语雀

```bash
$ waque login
```

## 初始化配置

在文档目录下运行下面的命令生成瓦雀的配置文件 `yuque.yml`。

这个命令会要求你输入语雀知识库的名字和要上传的文档，可以参考[配置说明](docs/configuration.md)来设置。

```bash
$ waque init
```

## 上传文档

使用下面的命令来上传文档，瓦雀会把文件名作为语雀上文档的 URL，所以文件名只能包含字母、数字、`_`和`-`（除非在文档里指定了 URL）。

```bash
$ waque upload
```

也可以指定文件上传。

```bash
$ waque upload foo.md bar.md
```

## 从已有仓库导出文档

如果你要把已有的仓库改用瓦雀管理，那么你可以用下面的命令先把文档导出成 markdown。

默认导出到当前目录下，如果指定目录，则目录要先存在。

```bash
$ waque export [DIR]
```

[导出再上传可能碰到的问题](docs/faq.md)

## 谁在使用

- [《Ant Design 实战教程》](https://www.yuque.com/ant-design/course)
