# Task Card: [B3] ElementRef 解析器

**Task ID**: B3
**Task Name**: ElementRef 统一元素定位协议
**Charter**: `docs/charter.B3.align.yaml`
**Stage**: B (Core Architecture)
**Status**: ✅ COMPLETED (Retrospective)
**Estimated**: 2 hours
**Actual**: ~2 hours
**Completed**: 2025-10-02

---

## 目标 (Goal)

实现 ElementRef 统一元素定位协议，支持多种定位方式（refId/selector/index），并提供自动缓存管理。

**交付物**:
- ✅ `src/core/element-ref.ts` (~150 lines)
- ✅ resolveElement() 函数
- ✅ resolvePage() 函数
- ✅ generateRefId() 函数

---

## 前置条件 (Prerequisites)

- ✅ A3: 仓库结构已初始化
- ✅ B2: SessionStore 实现（使用 elementCache）
- ✅ 了解 miniprogram-automator 选择器语法
- ✅ 了解 WXML 组件选择器

---

## 实现步骤 (Steps)

### 1. 定义 ElementRef 接口 ✅

**文件**: `src/types.ts`

**步骤**:
```typescript
export interface ElementRef {
  refId?: string        // 缓存的元素句柄 ID
  selector?: string     // WXML/CSS 选择器
  xpath?: string        // XPath 选择器（不支持，抛出错误）
  index?: number        // 多元素索引（从 0 开始）
  pagePath?: string     // 目标页面路径
  save?: boolean        // 是否缓存元素并返回 refId
}
```

**验证**: TypeScript 类型检查通过

---

### 2. 创建 element-ref.ts 文件 ✅

**文件**: `src/core/element-ref.ts`

**步骤**:
```typescript
import type { Element, Page, MiniProgram } from 'miniprogram-automator'
import type { ElementRef, SessionState } from '../types.js'

/**
 * 解析元素引用并返回 Element 对象
 */
export async function resolveElement(
  ref: ElementRef,
  session: SessionState
): Promise<{ element: Element; refId?: string }>

/**
 * 解析页面引用并返回 Page 对象
 */
export async function resolvePage(
  miniProgram: MiniProgram,
  ref: ElementRef
): Promise<Page>

/**
 * 生成唯一的元素引用 ID
 */
export function generateRefId(): string
```

**验证**: 文件创建成功，函数签名正确

---

### 3. 实现 generateRefId() ✅

**代码**:
```typescript
export function generateRefId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `elem-${timestamp}-${random}`
}
```

**验证**:
- 生成的 ID 格式正确
- 多次调用生成不同 ID
- ID 包含时间戳和随机字符

---

### 4. 实现 resolvePage() ✅

**代码**:
```typescript
export async function resolvePage(
  miniProgram: MiniProgram,
  ref: ElementRef
): Promise<Page> {
  // 1. 如果提供 pagePath，切换到指定页面
  if (ref.pagePath) {
    const page = await miniProgram.navigateTo(ref.pagePath)
    return page
  }

  // 2. 否则返回当前页面
  const page = await miniProgram.currentPage()
  if (!page) {
    throw new Error('No current page available')
  }

  return page
}
```

**验证**:
- pagePath 存在时，正确切换页面
- pagePath 不存在时，返回当前页面
- 无当前页面时，抛出错误

---

### 5. 实现 resolveElement() - 验证参数 ✅

**代码**:
```typescript
export async function resolveElement(
  ref: ElementRef,
  session: SessionState
): Promise<{ element: Element; refId?: string }> {
  // 1. 检查是否提供了有效的定位方式
  if (!ref.refId && !ref.selector && !ref.xpath) {
    throw new Error('ElementRef must provide refId, selector, or xpath')
  }

  // 2. XPath 不支持
  if (ref.xpath) {
    throw new Error(
      'XPath is not supported by miniprogram-automator. Please use selector instead.'
    )
  }

  // ...继续实现
}
```

**验证**:
- 无定位方式时抛出错误
- XPath 抛出明确的错误消息

---

### 6. 实现 resolveElement() - refId 路径 ✅

**代码**:
```typescript
// 3. 优先从缓存解析 refId
if (ref.refId) {
  const cachedElement = session.elementCache.get(ref.refId)
  if (!cachedElement) {
    throw new Error(`Element with refId ${ref.refId} not found in cache`)
  }
  return { element: cachedElement }
}
```

**验证**:
- refId 存在于缓存时返回缓存元素
- refId 不存在时抛出错误

---

### 7. 实现 resolveElement() - selector 路径 ✅

**代码**:
```typescript
// 4. 使用 selector 查询
if (!session.miniProgram) {
  throw new Error('MiniProgram not connected')
}

// 5. 解析页面
const page = await resolvePage(session.miniProgram, ref)

// 6. 查询元素
const selector = ref.selector!
let element: Element

if (ref.index !== undefined) {
  // 6.1 查询多个元素并取指定索引
  const elements = await page.$$(selector)
  if (ref.index >= elements.length) {
    throw new Error(
      `Element index ${ref.index} out of range (found ${elements.length} elements)`
    )
  }
  element = elements[ref.index]
} else {
  // 6.2 查询单个元素
  const result = await page.$(selector)
  if (!result) {
    throw new Error(`Element not found with selector: ${selector}`)
  }
  element = result
}
```

**验证**:
- selector 查询成功
- index 正确索引多元素
- 元素不存在时抛出错误
- index 越界时抛出错误

---

### 8. 实现 resolveElement() - save 缓存 ✅

**代码**:
```typescript
// 7. 如果需要缓存，生成 refId 并保存
if (ref.save) {
  const newRefId = generateRefId()
  session.elementCache.set(newRefId, element)
  return { element, refId: newRefId }
}

// 8. 不缓存直接返回
return { element }
```

**验证**:
- save=true 时生成新 refId
- 元素正确保存到缓存
- save=false 时不缓存

---

### 9. 添加完整的 JSDoc 注释 ✅

**代码**:
```typescript
/**
 * Resolves an ElementRef to an Element object
 *
 * Resolution order:
 * 1. If `refId` provided, lookup in session.elementCache
 * 2. If `selector` provided, query from page (with optional index)
 * 3. XPath is not supported (throws error)
 *
 * @param ref - Element reference with refId/selector/xpath/index/pagePath/save
 * @param session - Current session state
 * @returns Resolved Element and optional new refId (if save=true)
 * @throws Error if element not found or XPath used
 *
 * @example
 * // Use cached element
 * const { element } = await resolveElement({ refId: 'elem-123' }, session)
 *
 * @example
 * // Query and cache element
 * const { element, refId } = await resolveElement(
 *   { selector: '.btn-submit', save: true },
 *   session
 * )
 */
```

**验证**: JSDoc 完整，示例清晰

---

### 10. 编写单元测试（集成到工具测试）✅

**文件**: 随 C4 Element 工具测试验证

**测试场景**:
```typescript
// 测试通过 Element 工具间接验证
describe('ElementRef Resolution', () => {
  test('resolve by refId')
  test('resolve by selector')
  test('resolve with index')
  test('resolve with save')
  test('reject XPath')
  test('throw on missing element')
  test('throw on invalid refId')
})
```

**验证**: 所有测试通过

---

## 完成标准 (Definition of Done)

### 功能完成 ✅

- [x] generateRefId 生成唯一 ID
- [x] resolvePage 正确切换/返回页面
- [x] resolveElement 支持 refId 解析
- [x] resolveElement 支持 selector 解析
- [x] resolveElement 支持 index 索引
- [x] resolveElement 支持 save 缓存
- [x] XPath 抛出明确错误

### 代码质量 ✅

- [x] TypeScript 编译 0 错误
- [x] 无 ESLint 错误
- [x] 代码行数 ~150 行
- [x] JSDoc 注释完整
- [x] 符合 ESM 规范（.js 后缀）

### 测试 ✅

- [x] 单元测试随工具测试验证
- [x] 覆盖所有定位方式
- [x] 测试缓存机制
- [x] 测试错误场景

### 文档 ⏳

- [x] 代码注释完整
- [x] ElementRef 接口文档
- [x] 函数 JSDoc 完整
- ⏳ charter.B3.align.yaml (追溯)
- ⏳ tasks.B3.atomize.md (本文档)

---

## 实现结果 (Implementation)

### 文件清单

| 文件 | 行数 | 说明 |
|------|------|------|
| `src/core/element-ref.ts` | ~150 | ElementRef 解析器 |
| `src/types.ts` | +15 | ElementRef 接口 |

### 关键代码片段

**ElementRef 接口**:
```typescript
export interface ElementRef {
  refId?: string
  selector?: string
  xpath?: string
  index?: number
  pagePath?: string
  save?: boolean
}
```

**核心函数签名**:
```typescript
async function resolveElement(
  ref: ElementRef,
  session: SessionState
): Promise<{ element: Element; refId?: string }>

async function resolvePage(
  miniProgram: MiniProgram,
  ref: ElementRef
): Promise<Page>

function generateRefId(): string
```

### 设计决策

1. **优先级顺序**
   - refId > selector > xpath
   - 理由：缓存优先，性能最优

2. **XPath 明确拒绝**
   - 抛出清晰错误消息
   - 理由：SDK 不支持，避免误导用户

3. **index 支持**
   - 使用 $$ 查询多元素并索引
   - 理由：精确定位重复元素

4. **save 参数**
   - 可选缓存，返回新 refId
   - 理由：性能优化，减少重复查询

5. **分离 resolvePage**
   - 独立页面解析函数
   - 理由：复用性，清晰职责

---

## 测试证据 (Test Evidence)

### 单元测试（集成验证）

通过 C4 Element 工具测试验证：
```bash
$ pnpm test element.test.ts

✓ element_tap uses resolveElement
✓ refId resolution works
✓ selector resolution works
✓ index parameter works
✓ save parameter returns refId
✓ XPath throws error
✓ missing element throws error
```

### 集成测试

通过实际小程序测试：
- ✅ 点击按钮（selector）
- ✅ 输入文本（refId 缓存）
- ✅ 列表索引（index）
- ✅ 跨页面操作（pagePath）

---

## 已知问题 (Known Issues)

### 技术债务

1. **XPath 不支持** - 🟢 已明确
   - 原因：SDK 限制
   - 影响：用户无法使用 XPath
   - 缓解：清晰错误消息

2. **跨页面缓存失效** - 🟡 中优先级
   - 原因：元素句柄页面相关
   - 影响：页面切换后 refId 失效
   - 计划：自动清空缓存 + 错误提示

### 风险

1. **选择器冲突** - 🟡 中风险
   - 影响：selector 匹配多个元素
   - 缓解：index 参数精确定位
   - 监控：测试覆盖多元素场景

---

## 参考资料 (References)

### 文档

- `docs/微信小程序自动化完整操作手册.md` - 选择器语法
- `docs/完整实现方案.md` - ElementRef 协议设计
- `docs/charter.B3.align.yaml` - 任务对齐文档

### 代码

- `src/core/session.ts` - SessionState 和 elementCache（B2）
- `src/tools/element.ts` - Element 工具使用解析器（C4）

### 外部资源

- [miniprogram-automator 选择器文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/auto/)
- [WXML 组件选择器](https://developers.weixin.qq.com/miniprogram/dev/component/)

---

## 后续任务 (Next Steps)

### 依赖此任务的后续任务

- ✅ C4: Element 工具实现（已完成）
- ✅ 所有元素操作工具（已完成）

### 改进建议

1. **性能优化**
   - 缓存查询结果
   - 批量查询优化

2. **功能扩展**
   - 支持正则选择器
   - 支持自定义查询函数
   - 支持元素链式查询

3. **错误处理**
   - 更详细的错误上下文
   - 建议的修复方案
   - 调试信息输出

---

**任务状态**: ✅ COMPLETED
**代码提交**: ✅ 已提交（随 C4 Element 工具）
**文档状态**: ⏳ RETROSPECTIVE (追溯补齐中)
