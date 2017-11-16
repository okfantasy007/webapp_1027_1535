
1. sencha app build 命令
  进入extroot目录，运行sencha app build命令可在build目录下生成目标工程目录
  build
  ├── development
  ├── production
  └── temp

  production目录下是生产模式运行代码
  build/production/
  └── app
      ├── app.js
      ├── app.json
      ├── app.jsonp
      ├── archive
      ├── cache.appcache
      ├── deltas
      ├── index.html
      └── resources

  测试版本生成：
  进入extapp目录，运行sencha app build testing命令可在build目录下生成测试版目标文件，
  测试版的js文件没有压缩和优化，可以跟踪调试
  build/testing/
  └── app
      ├── app.js
      ├── app.json
      ├── app.jsonp
      ├── index.html
      └── resources

2. 用sencha cmd生成初始项目目录：
  *****WARNING***** 这个命令会覆盖当前项目，不要在已有项目目录下使用
  sencha -sdk components/extjs/ generate app --ext --classic app ./extroot
    -sdk components/extjs/    -- extjs SDK 源码目录
    generate app              -- 生成一个新项目命令
    --ext --classic           -- 只需要经典ui包
    app                       -- 项目的AppName
    ./extapp                  -- 项目根目录

3. 用sencha cmd生成自定义主题
  进入ext app根目录，输入以下命令：
  sencha generate theme my-classic-theme
  sencha generate theme my-gray-theme
  sencha generate theme my-triton-theme

  会生成如下目录
  packages/
  └── local
      ├── my-classic-theme
      ├── my-gray-theme
      └── my-triton-theme

  修改app.json中builds可以使用这些自定义主题
    "builds": {
        "classic": {
            "toolkit": "classic",
            "theme": "my-classic-theme"
        }
        ,"gray": {
            "toolkit": "classic",
            "theme": "my-gray-theme"
        }
        ,"triton": {
            "toolkit": "classic",
            "theme": "my-triton-theme"
        }
    },
  主题的定义及修改参考extjs6.2文档的core concepts中的theming system章节
    
4. 用sencha cmd对多语言的处理，sencha cmd会为每一种语言build一个完整的工程输出目录
  修改app.json中locales可以build出多语言版本的目标目录
    "locales": [
        "zh_CN"
        ,"en"
    ],

5. grunt使用
  在项目根目录（包含Gruntfile.js的目录）直接输入 grunt 命令可在build目录下生成整个前后台项目的打包目录
  输入 grunt debug 命令生成测试版打包目录，测试版中所有前后台js文件均为压缩和优化。

