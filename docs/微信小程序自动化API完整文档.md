# 微信小程序自动化 API 完整文档

> 基于官方文档整理：https://developers.weixin.qq.com/miniprogram/dev/devtools/auto/quick-start.html

## 目录

- [快速入门](#快速入门)
- [Automator API](#automator-api)
- [MiniProgram API](#miniprogram-api)
- [Page API](#page-api)
- [Element API](#element-api)
- [脚本示例](#脚本示例)
- [真机自动化](#真机自动化)

---

## 快速入门

### 运行环境

- 安装 Node.js 并且版本大于 8.0
- 基础库版本为 `2.7.3` 及以上
- 开发者工具版本为 `1.02.1907232` 及以上

### 安装

使用小程序自动化 SDK，直接执行以下命令：

```bash
npm i miniprogram-automator --save-dev
```

### 使用

首先开启工具安全设置中的 CLI/HTTP 调用功能。

> 必须开启以上选项，否则 SDK 将无法正常启动工具自动化功能。

然后直接引入 SDK 开始编写控制脚本，参考下边例子：

```javascript
const automator = require('miniprogram-automator')

automator.launch({
  cliPath: 'path/to/cli', // 工具 cli 位置，如果你没有更改过默认安装位置，可以忽略此项
  projectPath: 'path/to/project', // 项目文件地址
}).then(async miniProgram => {
  const page = await miniProgram.reLaunch('/page/component/index')
  await page.waitFor(500)
  const element = await page.$('.kind-list-item-hd')
  console.log(await element.attribute('class'))
  await element.tap()
  await miniProgram.close()
})
```

最后执行 `node path/to/script` 即可看到输出结果。

---

## Automator API

Automator 模块提供了启动及连接开发者工具的方法。

### automator.connect

连接开发者工具。

```typescript
automator.connect(options: Object): Promise<MiniProgram>
```

#### 参数说明

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| wsEndpoint | string | 是 | - | 开发者工具 WebSocket 地址 |

开发者工具开启自动化功能可以通过命令行调用：

- `--auto <project_root>`：打开指定项目并开启自动化功能
- `--auto-port <port>`：指定自动化监听端口

```bash
cli --auto /Users/username/demo --auto-port 9420
```

#### 示例代码

```javascript
automator.connect({
  wsEndpoint: 'ws://localhost:9420'
}).then(async miniProgram => {
  const page = await miniProgram.navigateTo('/page/component/index')
  await page.setData({})
})
```

### automator.launch

启动并连接开发者工具。

> 确保工具安全设置中已开启 CLI/HTTP 调用功能。

```typescript
automator.launch(options: Object): Promise<MiniProgram>
```

#### 参数说明

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| cliPath | string | 否 | - | 开发者工具命令行工具绝对路径 |
| projectPath | string | 是 | - | 项目绝对路径 |
| timeout | number | 否 | 30000 | 启动最长等待时间 |
| port | number | 否 | - | WebSocket 端口号 |
| account | string | 否 | - | 用户 openid |
| projectConfig | Object | 否 | - | 覆盖 project.config.json 中的配置 |
| ticket | string | 否 | - | 开发者工具登录票据 |

cliPath 未设置时将会在以下几个位置尝试寻找：

- Mac：`/Applications/wechatwebdevtools.app/Contents/MacOS/cli`
- Win：`C:/Program Files (x86)/Tencent/微信web开发者工具/cli.bat`

#### 示例代码

```javascript
automator.launch({
  cliPath: 'path/to/cli',
  projectPath: 'path/to/project',
  projectConfig: {
    setting: {
      autoAudits: true,
    },
  },
}).then(async miniProgram => {
  const page = await miniProgram.navigateTo('/page/component/index')
  await page.setData({})
})
```

---

## MiniProgram API

MiniProgram 模块提供了控制小程序的方法。

### 方法

#### miniProgram.pageStack

获取小程序页面堆栈。

```typescript
miniProgram.pageStack(): Promise<Page[]>
```

#### miniProgram.navigateTo

保留当前页面，跳转到应用内的某个页面，同 `wx.navigateTo`。

```typescript
miniProgram.navigateTo(url: string): Promise<Page>
```

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| url | string | 是 | - | 需要跳转的应用内非 tabBar 的页面的路径 |

#### miniProgram.redirectTo

关闭当前页面，跳转到应用内的某个页面，同 `wx.redirectTo`。

```typescript
miniProgram.redirectTo(url: string): Promise<Page>
```

#### miniProgram.navigateBack

关闭当前页面，返回上一页面或多级页面，同 `wx.navigateBack`。

```typescript
miniProgram.navigateBack(): Promise<Page>
```

#### miniProgram.reLaunch

关闭所有页面，打开到应用内的某个页面，同 `wx.reLaunch`。

```typescript
miniProgram.reLaunch(url: string): Promise<Page>
```

#### miniProgram.switchTab

跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面，同 `wx.switchTab`。

```typescript
miniProgram.switchTab(url: string): Promise<Page>
```

#### miniProgram.currentPage

获取当前页面。

```typescript
miniProgram.currentPage(): Promise<Page>
```

#### miniProgram.systemInfo

获取系统信息，同 `wx.getSystemInfo`。

```typescript
miniProgram.systemInfo(): Promise<Object>
```

#### miniProgram.callWxMethod

调用 wx 对象上的指定方法。

```typescript
miniProgram.callWxMethod(method: string, ...args: any[]): Promise<any>
```

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| method | string | 是 | - | 需要调用的方法名 |
| ...args | array<any> | 否 | - | 方法参数 |

调用异步方法时无需传入 success 及 fail 回调函数。

#### miniProgram.mockWxMethod

覆盖 wx 对象上指定方法的调用结果。

```typescript
miniProgram.mockWxMethod(method: string, result: any): Promise<void>
miniProgram.mockWxMethod(method: string, fn: Function | string, ...args: any[]): Promise<void>
```

#### miniProgram.restoreWxMethod

重置 wx 指定方法，消除 mockWxMethod 调用的影响。

```typescript
miniProgram.restoreWxMethod(method: string): Promise<void>
```

#### miniProgram.evaluate

往 AppService 注入代码片段并返回执行结果。

```typescript
miniProgram.evaluate(appFunction: Function | string, ...args: any[]): Promise<any>
```

#### miniProgram.pageScrollTo

将页面滚动到目标位置，同 `wx.pageScrollTo`。

```typescript
miniProgram.pageScrollTo(scrollTop: number): Promise<void>
```

#### miniProgram.screenshot

对当前页面截图，目前只有开发者工具模拟器支持，客户端无法使用。

```typescript
miniProgram.screenshot(options?: Object): Promise<string | void>
```

#### miniProgram.exposeFunction

在 AppService 全局暴露方法，供小程序侧调用测试脚本中的方法。

```typescript
miniProgram.exposeFunction(name: string, bindingFunction: Function): Promise<void>
```

#### miniProgram.testAccounts

获取多账号调试中已添加的用户列表。

```typescript
miniProgram.testAccounts(): Promise<Account[]>
```

#### miniProgram.remote

开启工具真机调试功能。

```typescript
miniProgram.remote(auto?: boolean): Promise<void>
```

#### miniProgram.disconnect

断开与小程序运行时的连接。

```typescript
miniProgram.disconnect(): void
```

#### miniProgram.close

断开与小程序运行时的连接并关闭项目窗口。

```typescript
miniProgram.close(): Promise<void>
```

### 事件

#### console

日志打印时触发。

传递一个 msg 参数，其字段如下：

| 字段 | 类型 | 说明 |
|------|------|------|
| type | string | 日志类型，log、info 等 |
| args | array<any> | 日志内容 |

#### exception

页面 JS 出错时触发。

传递一个 error 参数，其字段如下：

| 字段 | 类型 | 说明 |
|------|------|------|
| message | string | 错误信息 |
| stack | string | 错误堆栈 |

---

## Page API

Page 模块提供了控制小程序页面的方法。

### 属性

#### page.path

页面路径。

```typescript
page.path: string
```

#### page.query

页面参数。

```typescript
page.query: Object
```

### 方法

#### page.$

获取页面元素。

```typescript
page.$(selector: string): Promise<Element>
```

#### page.$$

获取页面元素数组。

```typescript
page.$$(selector: string): Promise<Element[]>
```

#### page.waitFor

等待直到指定条件成立。

```typescript
page.waitFor(condition: string | number | Function): Promise<void>
```

如果条件是 string 类型，那么该参数会被当成选择器，当该选择器选中元素个数不为零时，结束等待。

如果条件是 number 类型，那么该参数会被当成超时时长，当经过指定时间后，结束等待。

如果条件是 Function 类型，那么该参数会被当成断言函数，当该函数返回真值时，结束等待。

#### page.data

获取页面渲染数据。

```typescript
page.data(path?: string): Promise<Object>
```

#### page.setData

设置页面渲染数据。

```typescript
page.setData(data: Object): Promise<void>
```

#### page.size

获取页面大小。

```typescript
page.size(): Promise<Object>
```

返回值：

| 字段 | 类型 | 说明 |
|------|------|------|
| width | number | 页面可滚动宽度 |
| height | number | 页面可滚动高度 |

#### page.scrollTop

获取页面滚动位置。

```typescript
page.scrollTop(): Promise<number>
```

#### page.callMethod

调用页面指定方法。

```typescript
page.callMethod(method: string, ...args: any[]): Promise<any>
```

---

## Element API

Element 模块提供了控制小程序页面元素的方法。

### 属性

#### element.tagName

标签名，小写。

```typescript
element.tagName: string
```

### 方法

#### element.$

在元素范围内获取元素。

```typescript
element.$(selector: string): Promise<Element>
```

#### element.$$

在元素范围内获取元素数组。

```typescript
element.$$(selector: string): Promise<Element[]>
```

#### element.size

获取元素大小。

```typescript
element.size(): Promise<Object>
```

返回值：

| 字段 | 类型 | 说明 |
|------|------|------|
| width | number | 元素宽度 |
| height | number | 元素高度 |

#### element.offset

获取元素绝对位置。

```typescript
element.offset(): Promise<Object>
```

返回值：

| 字段 | 类型 | 说明 |
|------|------|------|
| left | number | 左上角 x 坐标，单位：px |
| top | number | 左上角 y 坐标，单位：px |

#### element.text

获取元素文本。

```typescript
element.text(): Promise<string>
```

#### element.attribute

获取元素特性。

```typescript
element.attribute(name: string): Promise<string>
```

#### element.property

获取元素属性。

```typescript
element.property(name: string): Promise<any>
```

element.property 与 element.attribute 主要区别如下：

- element.attribute 获取的是标签上的值，因此它的返回类型一定是字符串，element.property 则不一定
- element.attribute 可以获取到 class 和 id 之类的值，element.property 不行
- element.property 可以获取到文档里对应组件列举的大部分属性值，比如表单 input 等组件的 value 值

#### element.wxml

获取元素 WXML。

```typescript
element.wxml(): Promise<string>
```

#### element.outerWxml

同 wxml，只是会获取到元素本身。

```typescript
element.outerWxml(): Promise<string>
```

#### element.value

获取元素值。

```typescript
element.value(): Promise<string>
```

#### element.style

获取元素样式值。

```typescript
element.style(name: string): Promise<string>
```

#### element.tap

点击元素。

```typescript
element.tap(): Promise<void>
```

#### element.longpress

长按元素。

```typescript
element.longpress(): Promise<void>
```

#### element.touchstart

手指开始触摸元素。

```typescript
element.touchstart(options: Object): Promise<void>
```

#### element.touchmove

手指触摸元素后移动。

```typescript
element.touchmove(options: Object): Promise<void>
```

#### element.touchend

手指结束触摸元素。

```typescript
element.touchend(options: Object): Promise<void>
```

#### element.trigger

触发元素事件。

```typescript
element.trigger(type: string, detail?: Object): Promise<void>
```

> 该方法无法改变组件状态，仅触发响应方法，也无法触发用户操作事件，即 tap，longpress 等事件，请使用对应的其它方法调用。

#### element.input

输入文本，仅 input、textarea 组件可以使用。

```typescript
element.input(value: string): Promise<void>
```

#### element.callMethod

调用组件实例指定方法，仅自定义组件可以使用。

```typescript
element.callMethod(method: string, ...args: any[]): Promise<any>
```

#### element.data

获取组件实例渲染数据，仅自定义组件可以使用。

```typescript
element.data(path?: string): Promise<Object>
```

#### element.setData

设置组件实例渲染数据，仅自定义组件可以使用。

```typescript
element.setData(data: Object): Promise<void>
```

#### element.callContextMethod

调用上下文 Context 对象方法，仅 video 组件可以使用。

```typescript
element.callContextMethod(method: string, ...args: any[]): Promise<any>
```

#### element.scrollWidth

获取滚动宽度，仅 scroll-view 组件可以使用。

```typescript
element.scrollWidth(): Promise<number>
```

#### element.scrollHeight

获取滚动高度，仅 scroll-view 组件可以使用。

```typescript
element.scrollHeight(): Promise<number>
```

#### element.scrollTo

滚动到指定位置，仅 scroll-view 组件可以使用。

```typescript
element.scrollTo(x: number, y: number): Promise<void>
```

#### element.swipeTo

滑动到指定滑块，仅 swiper 组件可以使用。

```typescript
element.swipeTo(index: number): Promise<void>
```

#### element.moveTo

移动视图容器，仅 movable-view 组件可以使用。

```typescript
element.moveTo(x: number, y: number): Promise<void>
```

#### element.slideTo

滑动到指定数值，仅 slider 组件可以使用。

```typescript
element.slideTo(value: number): Promise<void>
```

---

## 脚本示例

小程序自动化 SDK 本身不提供测试框架。这意味着你可以将它与市面上流行的任意 Node.js 测试框架结合使用，以此来达到编写小程序测试用例的目的。接下来将使用 Jest 测试框架来编写一个实际的小程序自动化测试。

### 测试对象

这里以小程序示例为测试对象，从 GitHub 上将小程序示例的源码下载到本地，然后打开小程序工具，将该项目导入进去。

### 初始化

新建文件夹 `miniprogram-demo-test` 放置测试代码，执行以下命令安装依赖：

```bash
npm i miniprogram-automator jest
npm i jest -g
```

按照快速开始中的使用说明安装符合要求的开发者工具版本及打开安全设置 CLI/HTTP 调用功能后就可以开始编写脚本了。

### 脚本编写

现在我们准备为小程序示例的首页编写测试用例。

创建完测试文件 `index.spec.js` 后，首先要做的是：

- 启动并连接工具
- 重新启动小程序到首页
- 断开连接并关闭工具

对应脚本如下：

```javascript
const automator = require('miniprogram-automator')

describe('index', () => {
  let miniProgram
  let page

  beforeAll(async () => {
    miniProgram = await automator.launch({
      projectPath: 'path/to/miniprogram-demo'
    })
    page = await miniProgram.reLaunch('/page/component/index')
    await page.waitFor(500)
  }, 30000)

  afterAll(async () => {
    await miniProgram.close()
  })
})
```

> 工具项目窗口启动初次编译需要一定时长，Jest 默认 5 秒超时太短，需修改。

#### 1. 测试顶部描述

- 通过 .index-desc 选择器获取目标元素
- 目标元素应该是个 view 组件
- 目标元素应该包含有"以下将展示小程序官方组件能力"的文本

对应脚本如下：

```javascript
it('desc', async () => {
  const desc = await page.$('.index-desc')
  expect(desc.tagName).toBe('view')
  expect(await desc.text()).toContain('以下将展示小程序官方组件能力')
})
```

#### 2. 测试列表项

- 获取列表元素集合
- 目标元素集的个数应该是 8 个
- 第一个列表元素的标题应该是"视图容器"

对应脚本如下：

```javascript
it('list', async () => {
  const lists = await page.$$('.kind-list-item')
  expect(lists.length).toBe(8)
  const list = await lists[0].$('.kind-list-item-hd')
  expect(await list.text()).toBe('视图容器')
})
```

#### 3. 测试列表项行为

- 点击列表标题应该展示或隐藏子列表
- 点击子列表项应该会跳转到指定页面

对应脚本如下：

```javascript
it('list action', async () => {
  const listHead = await page.$('.kind-list-item-hd')
  expect(await listHead.attribute('class')).toBe('kind-list-item-hd')
  await listHead.tap()
  await page.waitFor(200)
  expect(await listHead.attribute('class')).toBe(
    'kind-list-item-hd kind-list-item-hd-show',
  )
  await listHead.tap()
  await page.waitFor(200)
  expect(await listHead.attribute('class')).toBe('kind-list-item-hd')
  await listHead.tap()
  await page.waitFor(200)
  const item = await page.$('.index-bd navigator')
  await item.tap()
  await page.waitFor(500)
  expect((await miniProgram.currentPage()).path).toBe('page/component/pages/view/view')
})
```

### 脚本执行

编写完脚本后直接执行以下脚本：

```bash
jest index.spec.js
```

如果看到控制台输出以下信息，说明测试成功。

```
PASS  ./index.spec.js (5.341s)
  index
    √ desc (18ms)
    √ list (14ms)
    √ list action (1274ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        6.378s
Ran all test suites matching /index.spec.js/i.
```

---

## 真机自动化

小程序自动化除了能够控制开发者工具中的小程序模拟器，也支持通过远程调试控制真机，以达到在真机上进行自动化测试的目的。

### 运行环境

- 确保目标机器上的基础库版本为 `2.7.3` 及以上

### 使用方式

在编写完测试用例并且在工具模拟器上测试成功之后，假如想要在真机上跑自动化，可以通过以下两种方法实现。

#### 通过 SDK 启动

你可以在测试脚本开头使用 `miniProgram.remote` 接口启动工具的真机调试功能，调用成功后脚本会在控制台打印二维码。使用目标机器扫码成功连接后，脚本会继续在真机上执行下去。

脚本示例：

```javascript
const automator = require('miniprogram-automator')

const miniProgram = automator.launch({
  cliPath: 'path/to/cli',
  projectPath: 'path/to/project',
}).then(async miniProgram => {
  await miniProgram.remote() // 扫码登录连接真机，在真机上执行后续测试脚本
  const page = await miniProgram.reLaunch('/page/component/index')
  await page.waitFor(500)
  const element = await page.$('.kind-list-item-hd')
  console.log(await element.attribute('class'))
  await element.tap()
  await miniProgram.close()
})
```

#### 手工启动

如果工具是打开常驻并且使用 `automator.connect` 接口进行连接，那么可以先手工启用工具的真机调试功能后再运行测试脚本，这样就可以在真机上测试小程序了。

---

## 补充说明

- 本文档基于微信小程序官方自动化文档整理
- 所有API均支持 Promise
- 更多详细信息请参考官方文档：https://developers.weixin.qq.com/miniprogram/dev/devtools/auto/
