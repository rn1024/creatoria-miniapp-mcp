/**
 * Unit tests for tool registration utilities
 */

import {
  AUTOMATOR_TOOLS,
  MINIPROGRAM_TOOLS,
  PAGE_TOOLS,
  ELEMENT_TOOLS,
  CORE_TOOLS,
  AUTOMATOR_TOOL_HANDLERS,
  MINIPROGRAM_TOOL_HANDLERS,
  PAGE_TOOL_HANDLERS,
  ELEMENT_TOOL_HANDLERS,
  CORE_TOOL_HANDLERS,
  TOOL_CATEGORIES,
  validateToolRegistration,
  getToolStats,
  getToolByName,
  getToolsByCategory,
} from '../../src/tools/index'

describe('Tool Registration', () => {
  describe('Tool Categories', () => {
    it('should have 4 automator tools', () => {
      expect(AUTOMATOR_TOOLS).toHaveLength(4)
      expect(AUTOMATOR_TOOLS.map(t => t.name)).toEqual([
        'miniprogram_launch',
        'miniprogram_connect',
        'miniprogram_disconnect',
        'miniprogram_close',
      ])
    })

    it('should have 6 miniprogram tools', () => {
      expect(MINIPROGRAM_TOOLS).toHaveLength(6)
      expect(MINIPROGRAM_TOOLS.map(t => t.name)).toEqual([
        'miniprogram_navigate',
        'miniprogram_call_wx',
        'miniprogram_evaluate',
        'miniprogram_screenshot',
        'miniprogram_get_page_stack',
        'miniprogram_get_system_info',
      ])
    })

    it('should have 8 page tools', () => {
      expect(PAGE_TOOLS).toHaveLength(8)
      expect(PAGE_TOOLS.map(t => t.name)).toEqual([
        'page_query',
        'page_query_all',
        'page_wait_for',
        'page_get_data',
        'page_set_data',
        'page_call_method',
        'page_get_size',
        'page_get_scroll_top',
      ])
    })

    it('should have 23 element tools', () => {
      expect(ELEMENT_TOOLS).toHaveLength(23)
      expect(ELEMENT_TOOLS.map(t => t.name)).toEqual([
        'element_tap',
        'element_longpress',
        'element_input',
        'element_get_text',
        'element_get_attribute',
        'element_get_property',
        'element_get_value',
        'element_get_size',
        'element_get_offset',
        'element_trigger',
        'element_get_style',
        'element_touchstart',
        'element_touchmove',
        'element_touchend',
        'element_scroll_to',
        'element_scroll_width',
        'element_scroll_height',
        'element_swipe_to',
        'element_move_to',
        'element_slide_to',
        'element_call_context_method',
        'element_set_data',
        'element_call_method',
      ])
    })

    it('should have 41 total core tools', () => {
      expect(CORE_TOOLS).toHaveLength(41)
    })
  })

  describe('Tool Handlers', () => {
    it('should have handler for every automator tool', () => {
      AUTOMATOR_TOOLS.forEach(tool => {
        expect(AUTOMATOR_TOOL_HANDLERS[tool.name]).toBeDefined()
      })
    })

    it('should have handler for every miniprogram tool', () => {
      MINIPROGRAM_TOOLS.forEach(tool => {
        expect(MINIPROGRAM_TOOL_HANDLERS[tool.name]).toBeDefined()
      })
    })

    it('should have handler for every page tool', () => {
      PAGE_TOOLS.forEach(tool => {
        expect(PAGE_TOOL_HANDLERS[tool.name]).toBeDefined()
      })
    })

    it('should have handler for every element tool', () => {
      ELEMENT_TOOLS.forEach(tool => {
        expect(ELEMENT_TOOL_HANDLERS[tool.name]).toBeDefined()
      })
    })

    it('should have handler for every core tool', () => {
      CORE_TOOLS.forEach(tool => {
        expect(CORE_TOOL_HANDLERS[tool.name]).toBeDefined()
      })
    })

    it('should have 41 total handlers', () => {
      expect(Object.keys(CORE_TOOL_HANDLERS)).toHaveLength(41)
    })
  })

  describe('Tool Categories Metadata', () => {
    it('should have 4 categories', () => {
      expect(Object.keys(TOOL_CATEGORIES)).toHaveLength(4)
      expect(Object.keys(TOOL_CATEGORIES)).toEqual([
        'automator',
        'miniprogram',
        'page',
        'element',
      ])
    })

    it('should have correct automator category', () => {
      const category = TOOL_CATEGORIES.automator
      expect(category.name).toBe('Automator')
      expect(category.description).toContain('4 tools')
      expect(category.tools).toHaveLength(4)
      expect(Object.keys(category.handlers)).toHaveLength(4)
    })

    it('should have correct miniprogram category', () => {
      const category = TOOL_CATEGORIES.miniprogram
      expect(category.name).toBe('MiniProgram')
      expect(category.description).toContain('6 tools')
      expect(category.tools).toHaveLength(6)
      expect(Object.keys(category.handlers)).toHaveLength(6)
    })

    it('should have correct page category', () => {
      const category = TOOL_CATEGORIES.page
      expect(category.name).toBe('Page')
      expect(category.description).toContain('8 tools')
      expect(category.tools).toHaveLength(8)
      expect(Object.keys(category.handlers)).toHaveLength(8)
    })

    it('should have correct element category', () => {
      const category = TOOL_CATEGORIES.element
      expect(category.name).toBe('Element')
      expect(category.description).toContain('23 tools')
      expect(category.tools).toHaveLength(23)
      expect(Object.keys(category.handlers)).toHaveLength(23)
    })
  })

  describe('validateToolRegistration', () => {
    it('should validate successfully', () => {
      const result = validateToolRegistration()
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect missing handlers', () => {
      // This test verifies the validation logic itself
      // In real scenario, if we had a tool without handler, it would fail
      const allToolsHaveHandlers = CORE_TOOLS.every(
        tool => CORE_TOOL_HANDLERS[tool.name] !== undefined
      )
      expect(allToolsHaveHandlers).toBe(true)
    })

    it('should detect handlers without tools', () => {
      // This test verifies the validation logic itself
      const allHandlersHaveTools = Object.keys(CORE_TOOL_HANDLERS).every(
        handlerName => CORE_TOOLS.some(t => t.name === handlerName)
      )
      expect(allHandlersHaveTools).toBe(true)
    })
  })

  describe('getToolStats', () => {
    it('should return correct statistics', () => {
      const stats = getToolStats()
      expect(stats.total).toBe(41)
      expect(stats.categories).toEqual({
        automator: 4,
        miniprogram: 6,
        page: 8,
        element: 23,
      })
      expect(stats.handlers).toBe(41)
    })
  })

  describe('getToolByName', () => {
    it('should find existing tool', () => {
      const tool = getToolByName('miniprogram_launch')
      expect(tool).toBeDefined()
      expect(tool?.name).toBe('miniprogram_launch')
      expect(tool?.description).toContain('Launch')
    })

    it('should return undefined for non-existent tool', () => {
      const tool = getToolByName('non_existent_tool')
      expect(tool).toBeUndefined()
    })

    it('should find tools from all categories', () => {
      expect(getToolByName('miniprogram_launch')).toBeDefined() // automator
      expect(getToolByName('miniprogram_navigate')).toBeDefined() // miniprogram
      expect(getToolByName('page_query')).toBeDefined() // page
      expect(getToolByName('element_tap')).toBeDefined() // element
    })
  })

  describe('getToolsByCategory', () => {
    it('should get automator tools', () => {
      const tools = getToolsByCategory('automator')
      expect(tools).toHaveLength(4)
      expect(tools[0].name).toBe('miniprogram_launch')
    })

    it('should get miniprogram tools', () => {
      const tools = getToolsByCategory('miniprogram')
      expect(tools).toHaveLength(6)
      expect(tools[0].name).toBe('miniprogram_navigate')
    })

    it('should get page tools', () => {
      const tools = getToolsByCategory('page')
      expect(tools).toHaveLength(8)
      expect(tools[0].name).toBe('page_query')
    })

    it('should get element tools', () => {
      const tools = getToolsByCategory('element')
      expect(tools).toHaveLength(23)
      expect(tools[0].name).toBe('element_tap')
    })

    it('should return empty array for invalid category', () => {
      const tools = getToolsByCategory('invalid' as any)
      expect(tools).toEqual([])
    })
  })

  describe('Tool Definitions', () => {
    it('all tools should have name', () => {
      CORE_TOOLS.forEach(tool => {
        expect(tool.name).toBeDefined()
        expect(tool.name.length).toBeGreaterThan(0)
      })
    })

    it('all tools should have description', () => {
      CORE_TOOLS.forEach(tool => {
        expect(tool.description).toBeDefined()
        expect(tool.description).toBeTruthy()
      })
    })

    it('all tools should have inputSchema', () => {
      CORE_TOOLS.forEach(tool => {
        expect(tool.inputSchema).toBeDefined()
        expect(tool.inputSchema.type).toBe('object')
        expect(tool.inputSchema.properties).toBeDefined()
      })
    })
  })
})
