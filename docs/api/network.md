# Network API

> Network 工具提供网络请求和微信 API 的模拟（Mock）功能，用于离线测试和错误场景模拟。

## 工具列表

| 工具名称 | 描述 | 主要用途 |
|---------|------|----------|
| `network_mock_wx_method` | 模拟任意微信 API | 通用 API 模拟 |
| `network_restore_wx_method` | 恢复被模拟的微信 API | 清除单个模拟 |
| `network_mock_request` | 模拟 wx.request 成功响应 | 网络请求成功场景 |
| `network_mock_request_failure` | 模拟 wx.request 失败 | 网络请求错误处理 |
| `network_restore_request` | 恢复 wx.request 原始行为 | 清除请求模拟 |
| `network_restore_all_mocks` | 恢复所有被模拟的 API | 批量清除模拟 |

---

## network_mock_wx_method

模拟任意微信 API 方法（`wx.*`），使其返回指定的结果或错误。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `method` | string | ✅ | - | 微信 API 方法名（如 `getSystemInfo`, `showToast`） |
| `result` | any | ✅ | - | 模拟的返回结果 |
| `type` | string | ⭐ | 'success' | 模拟类型：`'success'` 或 `'fail'` |

### 返回值

```typescript
{
  success: true,
  message: "Successfully mocked wx.getSystemInfo to return success"
}
```

### 错误处理

- **未连接**: `Error: MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.`
- **模拟失败**: `Error: Failed to mock wx.{method}: {errorMessage}`

### 使用示例

```javascript
// 示例 1: 模拟 getSystemInfo 返回固定设备信息
await network_mock_wx_method({
  method: "getSystemInfo",
  result: {
    model: "iPhone 13",
    system: "iOS 15.0",
    platform: "ios",
    windowWidth: 375,
    windowHeight: 667
  },
  type: "success"
})

// 后续调用 wx.getSystemInfo 会返回模拟数据
const info = await miniprogram_call_wx({
  method: "getSystemInfo"
})
console.log(info.result.model) // "iPhone 13"

// 示例 2: 模拟 getLocation 失败
await network_mock_wx_method({
  method: "getLocation",
  result: {
    errMsg: "getLocation:fail auth deny"
  },
  type: "fail"
})

// 示例 3: 模拟 showToast（无返回值的 API）
await network_mock_wx_method({
  method: "showToast",
  result: { errMsg: "showToast:ok" },
  type: "success"
})

// 示例 4: 模拟 getStorage 返回预设数据
await network_mock_wx_method({
  method: "getStorage",
  result: {
    data: { userId: 12345, token: "mock-token-abc" }
  },
  type: "success"
})

// 示例 5: 模拟网络断开场景
await network_mock_wx_method({
  method: "uploadFile",
  result: {
    errMsg: "uploadFile:fail network error"
  },
  type: "fail"
})
```

### 注意事项

- 💡 **适用范围**: 可模拟所有微信 API（`wx.*`），包括网络、存储、设备、媒体等
- ⚠️ **模拟优先级**: 模拟后，所有对该 API 的调用都会返回模拟结果，直到调用 `restore` 恢复
- 💡 **错误模拟**: 使用 `type: 'fail'` 模拟 API 失败场景，测试错误处理逻辑
- ⚠️ **会话隔离**: 模拟状态仅在当前会话有效，不影响其他会话或真实小程序

### 相关工具

- [`network_restore_wx_method`](#network_restore_wx_method) - 恢复被模拟的 API
- [`miniprogram_call_wx`](./miniprogram.md#miniprogram_call_wx) - 调用微信 API
- [`network_restore_all_mocks`](#network_restore_all_mocks) - 恢复所有模拟

---

## network_restore_wx_method

恢复被模拟的微信 API 方法，使其返回原始行为。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `method` | string | ✅ | - | 要恢复的微信 API 方法名 |

### 返回值

```typescript
{
  success: true,
  message: "Successfully restored wx.getSystemInfo to original behavior"
}
```

### 错误处理

- **未连接**: `Error: MiniProgram not connected`
- **恢复失败**: `Error: Failed to restore wx.{method}: {errorMessage}`

### 使用示例

```javascript
// 示例 1: 恢复单个 API
await network_mock_wx_method({
  method: "getSystemInfo",
  result: { model: "Mock Device" }
})
// ... 执行测试 ...
await network_restore_wx_method({
  method: "getSystemInfo"
})
// 现在 getSystemInfo 返回真实设备信息

// 示例 2: 测试完成后清理模拟
try {
  await network_mock_wx_method({
    method: "getLocation",
    result: { errMsg: "fail" },
    type: "fail"
  })

  // 测试错误处理逻辑
  await element_tap({ selector: ".get-location-btn" })
  await assert_exists({ selector: ".error-toast" })

} finally {
  // 确保恢复原始行为
  await network_restore_wx_method({
    method: "getLocation"
  })
}

// 示例 3: 切换模拟场景
// 先模拟成功场景
await network_mock_wx_method({
  method: "request",
  result: { data: { status: "ok" } },
  type: "success"
})
await element_tap({ selector: ".load-btn" })
await assert_exists({ selector: ".success-indicator" })

// 恢复后模拟失败场景
await network_restore_wx_method({ method: "request" })
await network_mock_wx_method({
  method: "request",
  result: { errMsg: "fail" },
  type: "fail"
})
await element_tap({ selector: ".load-btn" })
await assert_exists({ selector: ".error-message" })
```

### 注意事项

- 💡 **幂等操作**: 恢复未被模拟的 API 不会报错
- 💡 **局部恢复**: 仅恢复指定的单个 API，不影响其他已模拟的 API
- ⚠️ **测试清理**: 建议在测试结束时恢复所有模拟，避免影响后续测试

### 相关工具

- [`network_mock_wx_method`](#network_mock_wx_method) - 模拟微信 API
- [`network_restore_all_mocks`](#network_restore_all_mocks) - 恢复所有模拟

---

## network_mock_request

模拟 `wx.request` 成功返回指定数据，是 `network_mock_wx_method` 针对网络请求的便捷封装。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `data` | any | ⭐ | `{}` | 响应数据 |
| `statusCode` | number | ⭐ | `200` | HTTP 状态码 |
| `header` | object | ⭐ | `{}` | 响应头 |
| `type` | string | ⭐ | `'success'` | 模拟类型（通常使用默认值） |

### 返回值

```typescript
{
  success: true,
  message: "Successfully mocked wx.request to return success with status 200"
}
```

### 错误处理

- **未连接**: `Error: MiniProgram not connected`
- **模拟失败**: `Error: Failed to mock wx.request: {errorMessage}`

### 使用示例

```javascript
// 示例 1: 模拟简单的 API 响应
await network_mock_request({
  data: {
    code: 0,
    message: "success",
    data: {
      userId: 12345,
      username: "测试用户"
    }
  },
  statusCode: 200
})

// 触发请求
await element_tap({ selector: ".fetch-user-btn" })
await page_wait_for({ selector: ".user-info", timeout: 2000 })

// 验证数据显示正确
await assert_text({
  selector: ".username",
  expected: "测试用户"
})

// 示例 2: 模拟列表数据
await network_mock_request({
  data: {
    list: [
      { id: 1, name: "商品 1", price: 99 },
      { id: 2, name: "商品 2", price: 199 },
      { id: 3, name: "商品 3", price: 299 }
    ],
    total: 3
  }
})

await element_tap({ selector: ".load-products" })
const items = await page_query_all({ selector: ".product-item" })
console.log(`加载了 ${items.count} 个商品`) // 3

// 示例 3: 模拟分页响应
await network_mock_request({
  data: {
    page: 1,
    pageSize: 10,
    total: 100,
    items: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      title: `文章 ${i + 1}`
    }))
  }
})

// 示例 4: 模拟 404 错误（使用 statusCode）
await network_mock_request({
  data: { error: "Not Found" },
  statusCode: 404
})

await element_tap({ selector: ".load-detail" })
await assert_exists({ selector: ".not-found-page" })

// 示例 5: 模拟自定义响应头
await network_mock_request({
  data: { token: "new-token-xyz" },
  statusCode: 200,
  header: {
    "Content-Type": "application/json",
    "X-Request-Id": "mock-request-123"
  }
})
```

### 注意事项

- 💡 **便捷封装**: 专门用于 `wx.request`，无需手动构造响应格式
- ⚠️ **全局模拟**: 模拟后，所有 `wx.request` 调用都返回相同结果
- 💡 **状态码**: 可通过 `statusCode` 模拟不同 HTTP 状态（200, 404, 500 等）
- 💡 **响应格式**: `data` 字段支持任意 JSON 数据结构

### 相关工具

- [`network_mock_request_failure`](#network_mock_request_failure) - 模拟请求失败
- [`network_restore_request`](#network_restore_request) - 恢复请求原始行为
- [`miniprogram_call_wx`](./miniprogram.md#miniprogram_call_wx) - 调用 wx.request

---

## network_mock_request_failure

模拟 `wx.request` 失败，用于测试网络错误、超时等异常场景的错误处理逻辑。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `errMsg` | string | ⭐ | `'request:fail'` | 错误信息 |
| `errno` | number | ⭐ | `-1` | 错误码 |

### 返回值

```typescript
{
  success: true,
  message: "Successfully mocked wx.request to fail with: request:fail timeout"
}
```

### 错误处理

- **未连接**: `Error: MiniProgram not connected`
- **模拟失败**: `Error: Failed to mock wx.request failure: {errorMessage}`

### 使用示例

```javascript
// 示例 1: 模拟网络超时
await network_mock_request_failure({
  errMsg: "request:fail timeout"
})

await element_tap({ selector: ".load-data-btn" })
await page_wait_for({ selector: ".error-toast", timeout: 2000 })
await assert_text({
  selector: ".error-message",
  expected: "网络请求超时"
})

// 示例 2: 模拟网络断开
await network_mock_request_failure({
  errMsg: "request:fail network error",
  errno: -2
})

await element_tap({ selector: ".submit-form" })
await assert_exists({ selector: ".offline-indicator" })

// 示例 3: 模拟服务器错误
await network_mock_request_failure({
  errMsg: "request:fail server error",
  errno: 500
})

// 验证重试逻辑
await element_tap({ selector: ".retry-btn" })
await page_wait_for({ timeout: 1000 })
await assert_exists({ selector: ".error-toast" })

// 示例 4: 测试错误恢复流程
// 先模拟失败
await network_mock_request_failure({
  errMsg: "request:fail"
})
await element_tap({ selector: ".load-btn" })
await assert_exists({ selector: ".error-state" })

// 恢复正常，验证重试成功
await network_restore_request()
await network_mock_request({
  data: { status: "ok" }
})
await element_tap({ selector: ".retry-btn" })
await assert_exists({ selector: ".success-state" })

// 示例 5: 测试错误日志记录
await network_mock_request_failure({
  errMsg: "request:fail abort",
  errno: -999
})

await element_tap({ selector: ".upload-btn" })
// 验证错误日志是否正确记录
const data = await page_get_data({ path: "errorLog" })
console.log("错误日志:", data.data)
```

### 注意事项

- 💡 **错误模拟**: 专门用于测试错误处理、重试逻辑、降级方案
- ⚠️ **真实性**: `errMsg` 应使用微信官方错误格式（`method:fail reason`）
- 💡 **错误码**: `errno` 可设置为任意数值，用于测试不同错误类型
- 💡 **组合使用**: 与 `assert_exists` 配合验证错误提示是否正确显示

### 相关工具

- [`network_mock_request`](#network_mock_request) - 模拟请求成功
- [`network_restore_request`](#network_restore_request) - 恢复请求
- [`assert_exists`](./assert.md#assert_exists) - 验证错误提示元素

---

## network_restore_request

恢复 `wx.request` 的原始行为，清除之前的模拟设置。

### 参数

无参数

### 返回值

```typescript
{
  success: true,
  message: "Successfully restored wx.request to original behavior"
}
```

### 错误处理

- **未连接**: `Error: MiniProgram not connected`
- **恢复失败**: `Error: Failed to restore wx.request: {errorMessage}`

### 使用示例

```javascript
// 示例 1: 测试完成后恢复
await network_mock_request({
  data: { result: "mock-data" }
})
// ... 执行测试 ...
await network_restore_request()
// 现在 wx.request 发起真实网络请求

// 示例 2: 使用 try-finally 确保清理
try {
  await network_mock_request_failure({
    errMsg: "request:fail"
  })

  await element_tap({ selector: ".submit" })
  await assert_exists({ selector: ".error-message" })

} finally {
  await network_restore_request()
}

// 示例 3: 切换模拟场景
// 模拟成功场景
await network_mock_request({
  data: { items: [1, 2, 3] }
})
await element_tap({ selector: ".load" })
await assert_exists({ selector: ".item" })

// 恢复后模拟失败场景
await network_restore_request()
await network_mock_request_failure({
  errMsg: "request:fail timeout"
})
await element_tap({ selector: ".load" })
await assert_exists({ selector: ".timeout-error" })

// 示例 4: 测试套件清理
async function runNetworkTests() {
  // 测试 1: 成功场景
  await network_mock_request({ data: { ok: true } })
  await testSuccessCase()

  // 测试 2: 失败场景
  await network_restore_request()
  await network_mock_request_failure({ errMsg: "fail" })
  await testFailureCase()

  // 清理所有模拟
  await network_restore_request()
}
```

### 注意事项

- 💡 **清理建议**: 每个测试结束后应恢复，避免影响后续测试
- 💡 **幂等操作**: 重复调用不会报错
- 💡 **特定恢复**: 仅恢复 `wx.request`，不影响其他已模拟的 API

### 相关工具

- [`network_mock_request`](#network_mock_request) - 模拟请求成功
- [`network_mock_request_failure`](#network_mock_request_failure) - 模拟请求失败
- [`network_restore_all_mocks`](#network_restore_all_mocks) - 恢复所有模拟

---

## network_restore_all_mocks

恢复所有被模拟的微信 API 方法，批量清理模拟状态。

### 参数

无参数

### 返回值

```typescript
{
  success: true,
  message: "Successfully restored 5 mocked wx methods"
}
```

### 错误处理

- **未连接**: `Error: MiniProgram not connected`
- **恢复失败**: `Error: Failed to restore all mocks: {errorMessage}`

### 使用示例

```javascript
// 示例 1: 测试套件结束时清理
async function runAllTests() {
  try {
    // 模拟多个 API
    await network_mock_wx_method({
      method: "getSystemInfo",
      result: { model: "Mock" }
    })
    await network_mock_request({
      data: { items: [] }
    })
    await network_mock_wx_method({
      method: "getLocation",
      result: { latitude: 39.9, longitude: 116.4 }
    })

    // 运行测试...
    await testFeature1()
    await testFeature2()
    await testFeature3()

  } finally {
    // 一次性恢复所有模拟
    await network_restore_all_mocks()
  }
}

// 示例 2: 测试隔离
async function testWithIsolation() {
  // 每个测试前清理所有模拟
  await network_restore_all_mocks()

  // 设置当前测试的模拟
  await network_mock_request({
    data: { result: "test-specific-data" }
  })

  // 运行测试...
  await runTest()

  // 测试后清理
  await network_restore_all_mocks()
}

// 示例 3: 快速清理多个模拟
await network_mock_request({ data: {} })
await network_mock_wx_method({ method: "getStorage", result: {} })
await network_mock_wx_method({ method: "showToast", result: {} })

// ... 执行测试 ...

// 一次性清理，无需逐个恢复
await network_restore_all_mocks()

// 示例 4: 在测试钩子中使用
async function afterEach() {
  // 每个测试后自动清理所有模拟
  await network_restore_all_mocks()
}

async function testUserLogin() {
  await network_mock_request({
    data: { token: "test-token" }
  })
  // ... 测试逻辑 ...
}

async function testUserLogout() {
  await network_mock_request({
    data: { success: true }
  })
  // ... 测试逻辑 ...
}

// 每个测试后自动清理
await testUserLogin()
await afterEach()

await testUserLogout()
await afterEach()
```

### 注意事项

- 💡 **批量清理**: 尝试恢复常见的微信 API（request, storage, navigation 等）
- 💡 **容错处理**: 恢复未被模拟的 API 不会报错，静默跳过
- ⚠️ **覆盖范围**: 仅恢复预定义列表中的 API，可能无法覆盖所有已模拟的 API
- 💡 **测试隔离**: 建议在测试套件开始/结束时调用，确保测试间隔离

### 覆盖的 API 列表

以下微信 API 会被尝试恢复：
- `request`, `uploadFile`, `downloadFile`, `connectSocket`
- `getStorage`, `setStorage`, `removeStorage`, `clearStorage`
- `getSystemInfo`, `getLocation`, `chooseImage`
- `showToast`, `showModal`
- `navigateTo`, `redirectTo`

### 相关工具

- [`network_restore_wx_method`](#network_restore_wx_method) - 恢复单个 API
- [`network_restore_request`](#network_restore_request) - 恢复请求 API
- [`network_mock_wx_method`](#network_mock_wx_method) - 模拟任意 API

---

## 完整示例：网络请求模拟与测试

```javascript
// 场景：测试商品列表页的加载、错误处理和重试逻辑
async function testProductListWithNetworkMock() {
  try {
    // 1. 启动小程序
    await automator_launch({
      projectPath: "/path/to/project"
    })
    await miniprogram_navigate({
      method: "navigateTo",
      url: "/pages/product/list"
    })

    // 2. 测试加载成功场景
    console.log("📋 测试 1: 加载成功")
    await network_mock_request({
      data: {
        code: 0,
        data: {
          list: [
            { id: 1, name: "商品 A", price: 99 },
            { id: 2, name: "商品 B", price: 199 },
            { id: 3, name: "商品 C", price: 299 }
          ],
          total: 3
        }
      },
      statusCode: 200
    })

    await element_tap({ selector: ".load-products-btn" })
    await page_wait_for({ selector: ".product-item", timeout: 2000 })

    const items = await page_query_all({ selector: ".product-item" })
    console.log(`✅ 成功加载 ${items.count} 个商品`)

    // 3. 测试网络超时场景
    console.log("📋 测试 2: 网络超时")
    await network_restore_request()
    await network_mock_request_failure({
      errMsg: "request:fail timeout",
      errno: -1
    })

    await element_tap({ selector: ".refresh-btn" })
    await page_wait_for({ selector: ".error-toast", timeout: 2000 })
    await assert_text({
      selector: ".error-message",
      expected: "网络请求超时"
    })
    console.log("✅ 超时错误提示正确")

    // 4. 测试重试逻辑
    console.log("📋 测试 3: 重试成功")
    await network_restore_request()
    await network_mock_request({
      data: {
        code: 0,
        data: {
          list: [
            { id: 4, name: "商品 D", price: 399 }
          ],
          total: 1
        }
      }
    })

    await element_tap({ selector: ".retry-btn" })
    await page_wait_for({ selector: ".product-item", timeout: 2000 })
    await assert_exists({ selector: ".success-indicator" })
    console.log("✅ 重试成功")

    // 5. 测试服务器错误（500）
    console.log("📋 测试 4: 服务器错误")
    await network_restore_request()
    await network_mock_request({
      data: { error: "Internal Server Error" },
      statusCode: 500
    })

    await element_tap({ selector: ".load-more-btn" })
    await page_wait_for({ selector: ".server-error-message", timeout: 2000 })
    console.log("✅ 服务器错误处理正确")

    // 6. 测试空数据场景
    console.log("📋 测试 5: 空数据")
    await network_restore_request()
    await network_mock_request({
      data: {
        code: 0,
        data: {
          list: [],
          total: 0
        }
      }
    })

    await element_tap({ selector: ".clear-and-reload-btn" })
    await page_wait_for({ selector: ".empty-state", timeout: 2000 })
    await assert_text({
      selector: ".empty-message",
      expected: "暂无商品"
    })
    console.log("✅ 空状态显示正确")

    // 7. 清理所有模拟
    await network_restore_all_mocks()
    console.log("✅ 所有测试完成，模拟已清理")

    // 8. 截图留档
    await miniprogram_screenshot({
      filename: "network-test-complete.png"
    })

  } catch (error) {
    console.error("❌ 测试失败:", error.message)
    await miniprogram_screenshot({
      filename: "network-test-error.png"
    })
    throw error
  } finally {
    // 确保清理
    await network_restore_all_mocks()
    await automator_disconnect()
  }
}

testProductListWithNetworkMock()
```

---

## 故障排除

### 问题 1: 模拟不生效

**错误**: 模拟后仍然发起真实网络请求

**解决方案**:
1. 确认模拟在请求前已设置
2. 检查 `method` 参数是否正确（大小写敏感）
3. 验证小程序代码是否使用了 `wx.request`（而非 `fetch` 等其他方法）

```javascript
// ❌ 错误：模拟在请求后设置
await element_tap({ selector: ".load-btn" })
await network_mock_request({ data: {} })  // 太晚了

// ✅ 正确：先模拟，后触发
await network_mock_request({ data: {} })
await element_tap({ selector: ".load-btn" })
```

### 问题 2: 多次模拟冲突

**错误**: 第二次模拟覆盖了第一次

**解决方案**:
1. 每次模拟前先恢复之前的模拟
2. 使用 `network_restore_request()` 清除旧模拟

```javascript
// ❌ 错误：直接覆盖可能导致混乱
await network_mock_request({ data: { a: 1 } })
await network_mock_request({ data: { b: 2 } })  // 覆盖了前一个

// ✅ 正确：先恢复，再模拟
await network_mock_request({ data: { a: 1 } })
await testScenario1()

await network_restore_request()  // 清除
await network_mock_request({ data: { b: 2 } })
await testScenario2()
```

### 问题 3: 忘记清理模拟

**错误**: 模拟影响了后续测试

**解决方案**:
1. 使用 `try-finally` 确保清理
2. 在测试结束时调用 `network_restore_all_mocks()`

```javascript
// ❌ 错误：异常时未清理
await network_mock_request({ data: {} })
await runTest()
await network_restore_request()  // 如果 runTest 抛出异常，这行不会执行

// ✅ 正确：使用 finally 确保清理
try {
  await network_mock_request({ data: {} })
  await runTest()
} finally {
  await network_restore_all_mocks()
}
```

---

## 技术细节

### 模拟机制

- **原理**: 使用 `miniprogram-automator` 的 `mockWxMethod` API 劫持微信 API 调用
- **作用域**: 仅影响当前自动化会话，不影响真实小程序或其他会话
- **优先级**: 模拟优先于原始 API，直到显式恢复

### 模拟状态管理

- **存储**: 模拟状态由 `miniprogram-automator` SDK 内部管理
- **生命周期**: 从设置模拟到恢复模拟，或会话结束
- **清理**: 会话断开时自动清理所有模拟

### 常见模拟场景

| 场景 | 工具 | 用途 |
|------|------|------|
| 成功响应 | `network_mock_request` | 测试正常流程 |
| 网络超时 | `network_mock_request_failure` | 测试超时处理 |
| 服务器错误 | `network_mock_request` + `statusCode: 500` | 测试错误处理 |
| 空数据 | `network_mock_request` + `data: { list: [] }` | 测试空状态 |
| 权限拒绝 | `network_mock_wx_method` + `type: 'fail'` | 测试权限错误 |

---

**相关文档**:
- [MiniProgram API](./miniprogram.md) - 调用微信 API
- [Assert API](./assert.md) - 验证模拟效果
- [使用示例](../../examples/03-network-testing.md) - 网络测试示例

**最后更新**: 2025-10-03
