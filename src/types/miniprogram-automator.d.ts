/**
 * TypeScript definitions for miniprogram-automator SDK
 * Based on WeChat Mini Program Automation Testing v0.12.1
 *
 * Note: This is a community type definition. For complete API reference,
 * see: https://developers.weixin.qq.com/miniprogram/dev/devtools/auto/
 */

/**
 * Screenshot options
 */
export interface ScreenshotOptions {
  path?: string
  fullPage?: boolean
}

/**
 * Element object returned by page queries
 */
export interface Element {
  /**
   * Tap the element
   */
  tap(): Promise<void>

  /**
   * Long press the element
   */
  longpress(): Promise<void>

  /**
   * Swipe the element
   */
  swipe(direction: 'up' | 'down' | 'left' | 'right', duration?: number): Promise<void>

  /**
   * Input text into the element
   */
  input(text: string): Promise<void>

  /**
   * Trigger an event on the element
   */
  trigger(eventName: string, detail?: any): Promise<void>

  /**
   * Trigger touch events
   */
  touchstart(options?: {
    x?: number
    y?: number
    touches?: any[]
    changedTouches?: any[]
  }): Promise<void>
  touchmove(options?: {
    x?: number
    y?: number
    touches?: any[]
    changedTouches?: any[]
  }): Promise<void>
  touchend(options?: {
    x?: number
    y?: number
    touches?: any[]
    changedTouches?: any[]
  }): Promise<void>

  /**
   * Get element property value
   */
  property(name: string): Promise<any>

  /**
   * Get element attribute value
   */
  attribute(name: string): Promise<string | null>

  /**
   * Get element text content
   */
  text(): Promise<string>

  /**
   * Get element size
   */
  size(): Promise<{ width: number; height: number } | null>

  /**
   * Get element offset
   */
  offset(): Promise<{ left: number; top: number } | null>

  /**
   * Get element value (for input/textarea)
   */
  value(): Promise<any>

  /**
   * Get element style
   */
  style(name: string): Promise<string>

  /**
   * Call a method on the component (for custom components)
   */
  callMethod(method: string, ...args: any[]): Promise<any>

  /**
   * Get data from the component (for custom components)
   */
  data(path?: string): Promise<any>

  /**
   * Query child elements
   */
  $(selector: string): Promise<Element | null>
  $$(selector: string): Promise<Element[]>

  /**
   * Scroll element to position
   */
  scrollTo(x: number, y: number): Promise<void>

  /**
   * Get scroll width
   */
  scrollWidth(): Promise<number>

  /**
   * Get scroll height
   */
  scrollHeight(): Promise<number>

  /**
   * Swipe to a specific index (for swiper components)
   */
  swipeTo(index: number): Promise<void>

  /**
   * Move slider to position
   */
  moveTo(x: number, y: number): Promise<void>

  /**
   * Slide to a specific value (for slider components)
   */
  slideTo(value: number): Promise<void>

  /**
   * Call a canvas context method (for canvas components)
   */
  callContextMethod(method: string, ...args: any[]): Promise<any>

  /**
   * Set component data (for custom components)
   */
  setData(data: Record<string, any>): Promise<void>

  /**
   * Call a method on the component (for custom components)
   */
  callMethod(method: string, ...args: any[]): Promise<any>
}

/**
 * Page information from page stack
 */
export interface PageInfo {
  /**
   * Page path (without leading slash)
   */
  path: string

  /**
   * Page query parameters
   */
  query: Record<string, any>
}

/**
 * Page object for querying and manipulating page state
 */
export interface Page extends PageInfo {
  /**
   * Query single element on the page
   */
  $(selector: string): Promise<Element | null>

  /**
   * Query all matching elements on the page
   */
  $$(selector: string): Promise<Element[]>

  /**
   * Query element by XPath (requires SDK 0.11.0+)
   */
  getElementByXpath?(xpath: string): Promise<Element | null>
  getElementsByXpath?(xpath: string): Promise<Element[]>
  xpath?(xpath: string): Promise<Element | null>

  /**
   * Wait for a condition on the page
   */
  waitFor(condition: string | number | (() => boolean), timeout?: number): Promise<void>

  /**
   * Get page data
   */
  data(path?: string): Promise<any>

  /**
   * Set page data
   */
  setData(data: Record<string, any>): Promise<void>

  /**
   * Call a method on the page
   */
  callMethod(method: string, ...args: any[]): Promise<any>

  /**
   * Scroll the page
   */
  scrollTo(x: number, y: number): Promise<void>

  /**
   * Get page size
   */
  size(): Promise<{ width: number; height: number }>

  /**
   * Get page scroll position
   */
  scrollTop(): Promise<number>
}

/**
 * System information returned by wx.getSystemInfo
 */
export interface SystemInfo {
  /**
   * Device brand
   */
  brand: string

  /**
   * Device model
   */
  model: string

  /**
   * Operating system and version
   */
  system: string

  /**
   * Client platform
   */
  platform: string

  /**
   * Screen width (px)
   */
  screenWidth: number

  /**
   * Screen height (px)
   */
  screenHeight: number

  /**
   * Window width (px)
   */
  windowWidth: number

  /**
   * Window height (px)
   */
  windowHeight: number

  /**
   * Status bar height (px)
   */
  statusBarHeight: number

  /**
   * Base library version
   */
  SDKVersion: string

  /**
   * WeChat version
   */
  version: string

  [key: string]: any
}

/**
 * MiniProgram instance for controlling the mini program
 */
export interface MiniProgram {
  /**
   * Navigate to a page using navigateTo
   */
  navigateTo(url: string): Promise<Page | undefined>

  /**
   * Navigate to a page using redirectTo
   */
  redirectTo(url: string): Promise<Page | undefined>

  /**
   * Navigate to a page using reLaunch
   */
  reLaunch(url: string): Promise<Page | undefined>

  /**
   * Switch to a tab page
   */
  switchTab(url: string): Promise<Page | undefined>

  /**
   * Navigate back
   */
  navigateBack(delta?: number): Promise<Page | undefined>

  /**
   * Get current page
   */
  currentPage(): Promise<Page | undefined>

  /**
   * Get page stack
   */
  pageStack(): Promise<Page[]>

  /**
   * Get system information
   */
  systemInfo(): Promise<SystemInfo>

  /**
   * Take a screenshot
   */
  screenshot(options?: ScreenshotOptions): Promise<Buffer>

  /**
   * Evaluate JavaScript expression in mini program context
   */
  evaluate<T = any>(expression: string | ((...args: any[]) => T), ...args: any[]): Promise<T>

  /**
   * Call a WeChat API method (wx.*)
   */
  callWxMethod(method: string, ...args: any[]): Promise<any>

  /**
   * Mock WeChat API
   */
  mockWxMethod(method: string, result: any, options?: { type?: 'success' | 'fail' }): void

  /**
   * Restore mocked WeChat API
   */
  restoreWxMethod(method: string): void

  /**
   * Disconnect from the mini program
   */
  disconnect(): Promise<void>

  /**
   * Close the mini program (IDE window)
   */
  close(): Promise<void>
}

/**
 * Launch options for starting a mini program
 */
export interface LaunchOptions {
  /**
   * Project path
   */
  projectPath: string

  /**
   * CLI tool path
   */
  cliPath?: string

  /**
   * Automation port (default: 9420)
   */
  port?: number

  /**
   * Enable debugging
   */
  debug?: boolean

  /**
   * Compile condition name
   */
  compileCondition?: string

  /**
   * Custom compile options
   */
  compileOptions?: {
    /**
     * Entry page path
     */
    page?: string

    /**
     * Page query parameters
     */
    query?: string

    /**
     * Launch mode
     */
    scene?: number
  }
}

/**
 * Connect options for connecting to an existing mini program
 */
export interface ConnectOptions {
  /**
   * WebSocket port (default: 9420)
   */
  port?: number

  /**
   * Connection timeout in milliseconds
   */
  timeout?: number
}

/**
 * Main automator module for launching and connecting to mini programs
 */
export interface Automator {
  /**
   * Launch a mini program
   */
  launch(options: LaunchOptions): Promise<MiniProgram>

  /**
   * Connect to an already launched mini program
   */
  connect(options: ConnectOptions): Promise<MiniProgram>
}

/**
 * Default export of miniprogram-automator
 */
declare const automator: Automator

export default automator
