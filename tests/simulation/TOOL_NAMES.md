# MCP Tool Names Reference

## 正确的工具名称（用于测试）

### Automator (MiniProgram Lifecycle)
- `miniprogram_launch` - 启动小程序
- `miniprogram_connect` - 连接到已运行的小程序
- `miniprogram_disconnect` - 断开连接
- `miniprogram_close` - 关闭小程序

### MiniProgram Operations  
- `miniprogram_navigate` - 页面导航
- `miniprogram_call_wx` - 调用 wx API
- `miniprogram_evaluate` - 执行 JS 代码
- `miniprogram_screenshot` - 截图
- `miniprogram_get_page_stack` - 获取页面栈
- `miniprogram_get_system_info` - 获取系统信息

### Page Operations
- `page_query` - 查询元素
- `page_query_all` - 查询所有匹配元素
- `page_wait_for` - 等待元素出现
- `page_get_data` - 获取页面 data
- `page_set_data` - 设置页面 data
- `page_call_method` - 调用页面方法
- `page_get_size` - 获取页面尺寸
- `page_get_scroll_top` - 获取滚动位置

### Element Operations
- `element_tap` - 点击元素
- `element_longpress` - 长按元素
- `element_input` - 输入文本
- `element_get_text` - 获取文本
- `element_get_attribute` - 获取属性
- `element_get_property` - 获取属性
- `element_get_value` - 获取值
- `element_get_size` - 获取尺寸
- `element_get_offset` - 获取偏移
- `element_trigger` - 触发事件
- `element_get_style` - 获取样式
- (and more touch/scroll operations...)

### Assert Operations
- `assert_exists` - 断言元素存在
- `assert_not_exists` - 断言元素不存在
- `assert_text` - 断言文本内容
- `assert_text_contains` - 断言文本包含
- `assert_value` - 断言值
- `assert_attribute` - 断言属性
- `assert_property` - 断言属性
- `assert_data` - 断言 data
- `assert_visible` - 断言可见性

### Snapshot Operations
- `snapshot_page` - 页面快照
- `snapshot_full` - 完整快照
- `snapshot_element` - 元素快照

### Record Operations
- `record_start` - 开始录制
- `record_stop` - 停止录制
- `record_list` - 列出录制
- `record_get` - 获取录制
- `record_delete` - 删除录制
- `record_replay` - 回放录制

### Network Mock Operations
- `network_mock_wx` - Mock wx API
- `network_restore_wx` - 恢复 wx API
- `network_mock_request` - Mock 网络请求
- `network_mock_request_failure` - Mock 请求失败
- `network_restore_request` - 恢复网络请求
- `network_restore_all` - 恢复所有 Mock

## 常见错误

❌ `automator_launch` → ✅ `miniprogram_launch`
❌ `miniprogram_navigate_to` → ✅ `miniprogram_navigate`
❌ `assert_element_exists` → ✅ `assert_exists`
❌ `element_click` → ✅ `element_tap`
