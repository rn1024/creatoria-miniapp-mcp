/**
 * Unit tests for config defaults
 */

import {
  DEFAULT_CLI_PATH_MACOS,
  DEFAULT_AUTOMATION_PORT,
  DEFAULT_OUTPUT_DIR,
  DEFAULT_SESSION_TIMEOUT,
  DEFAULT_TIMEOUT,
  DEFAULT_EVALUATE_TIMEOUT,
  DEFAULT_LAUNCH_TIMEOUT,
  DEFAULT_SCREENSHOT_TIMEOUT,
  DEFAULT_CAPABILITIES,
  DEFAULT_SERVER_CONFIG,
  DEFAULT_SESSION_CONFIG,
  getDefaultCliPath,
  mergeServerConfig,
  mergeSessionConfig,
} from '../../src/config/defaults'

describe('Config Defaults', () => {
  describe('Constants', () => {
    it('should have sensible default values', () => {
      expect(DEFAULT_CLI_PATH_MACOS).toBe(
        '/Applications/wechatwebdevtools.app/Contents/MacOS/cli'
      )
      expect(DEFAULT_AUTOMATION_PORT).toBe(9420)
      expect(DEFAULT_OUTPUT_DIR).toBe('.mcp-artifacts')
      expect(DEFAULT_SESSION_TIMEOUT).toBe(30 * 60 * 1000) // 30 minutes
      expect(DEFAULT_TIMEOUT).toBe(30 * 1000) // 30 seconds
      expect(DEFAULT_EVALUATE_TIMEOUT).toBe(5 * 1000) // 5 seconds
      expect(DEFAULT_LAUNCH_TIMEOUT).toBe(60 * 1000) // 60 seconds
      expect(DEFAULT_SCREENSHOT_TIMEOUT).toBe(10 * 1000) // 10 seconds
      expect(DEFAULT_CAPABILITIES).toEqual(['core'])
    })
  })

  describe('DEFAULT_SERVER_CONFIG', () => {
    it('should have all required server config fields', () => {
      expect(DEFAULT_SERVER_CONFIG).toHaveProperty('projectPath')
      expect(DEFAULT_SERVER_CONFIG).toHaveProperty('cliPath')
      expect(DEFAULT_SERVER_CONFIG).toHaveProperty('port')
      expect(DEFAULT_SERVER_CONFIG).toHaveProperty('capabilities')
      expect(DEFAULT_SERVER_CONFIG).toHaveProperty('outputDir')
      expect(DEFAULT_SERVER_CONFIG).toHaveProperty('timeout')
      expect(DEFAULT_SERVER_CONFIG).toHaveProperty('sessionTimeout')
    })

    it('should use default values', () => {
      expect(DEFAULT_SERVER_CONFIG.port).toBe(DEFAULT_AUTOMATION_PORT)
      expect(DEFAULT_SERVER_CONFIG.capabilities).toEqual(DEFAULT_CAPABILITIES)
      expect(DEFAULT_SERVER_CONFIG.outputDir).toBe(DEFAULT_OUTPUT_DIR)
      expect(DEFAULT_SERVER_CONFIG.timeout).toBe(DEFAULT_TIMEOUT)
      expect(DEFAULT_SERVER_CONFIG.sessionTimeout).toBe(DEFAULT_SESSION_TIMEOUT)
    })
  })

  describe('DEFAULT_SESSION_CONFIG', () => {
    it('should have all required session config fields', () => {
      expect(DEFAULT_SESSION_CONFIG).toHaveProperty('projectPath')
      expect(DEFAULT_SESSION_CONFIG).toHaveProperty('cliPath')
      expect(DEFAULT_SESSION_CONFIG).toHaveProperty('port')
      expect(DEFAULT_SESSION_CONFIG).toHaveProperty('timeout')
      expect(DEFAULT_SESSION_CONFIG).toHaveProperty('evaluateTimeout')
      expect(DEFAULT_SESSION_CONFIG).toHaveProperty('launchTimeout')
      expect(DEFAULT_SESSION_CONFIG).toHaveProperty('screenshotTimeout')
    })

    it('should use default timeout values', () => {
      expect(DEFAULT_SESSION_CONFIG.timeout).toBe(DEFAULT_TIMEOUT)
      expect(DEFAULT_SESSION_CONFIG.evaluateTimeout).toBe(DEFAULT_EVALUATE_TIMEOUT)
      expect(DEFAULT_SESSION_CONFIG.launchTimeout).toBe(DEFAULT_LAUNCH_TIMEOUT)
      expect(DEFAULT_SESSION_CONFIG.screenshotTimeout).toBe(DEFAULT_SCREENSHOT_TIMEOUT)
    })
  })

  describe('getDefaultCliPath', () => {
    it('should return macOS path on darwin platform', () => {
      const originalPlatform = process.platform
      Object.defineProperty(process, 'platform', {
        value: 'darwin',
      })

      expect(getDefaultCliPath()).toBe(DEFAULT_CLI_PATH_MACOS)

      // Restore
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
      })
    })

    it('should return empty string on non-darwin platforms', () => {
      const originalPlatform = process.platform
      Object.defineProperty(process, 'platform', {
        value: 'win32',
      })

      expect(getDefaultCliPath()).toBe('')

      // Restore
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
      })
    })
  })

  describe('mergeServerConfig', () => {
    it('should use defaults when no user config provided', () => {
      const merged = mergeServerConfig({})

      expect(merged).toMatchObject({
        projectPath: '',
        port: DEFAULT_AUTOMATION_PORT,
        capabilities: DEFAULT_CAPABILITIES,
        outputDir: DEFAULT_OUTPUT_DIR,
        timeout: DEFAULT_TIMEOUT,
        sessionTimeout: DEFAULT_SESSION_TIMEOUT,
      })
    })

    it('should override defaults with user config', () => {
      const userConfig = {
        projectPath: '/path/to/project',
        port: 8080,
        timeout: 5000,
      }

      const merged = mergeServerConfig(userConfig)

      expect(merged.projectPath).toBe('/path/to/project')
      expect(merged.port).toBe(8080)
      expect(merged.timeout).toBe(5000)
      // Other fields should still have defaults
      expect(merged.capabilities).toEqual(DEFAULT_CAPABILITIES)
      expect(merged.outputDir).toBe(DEFAULT_OUTPUT_DIR)
    })

    it('should handle custom capabilities', () => {
      const userConfig = {
        capabilities: ['automator', 'page'],
      }

      const merged = mergeServerConfig(userConfig)

      expect(merged.capabilities).toEqual(['automator', 'page'])
    })

    it('should use platform-specific CLI path if not provided', () => {
      const merged = mergeServerConfig({})

      if (process.platform === 'darwin') {
        expect(merged.cliPath).toBe(DEFAULT_CLI_PATH_MACOS)
      } else {
        expect(merged.cliPath).toBe('')
      }
    })

    it('should not override provided CLI path', () => {
      const userConfig = {
        cliPath: '/custom/path/to/cli',
      }

      const merged = mergeServerConfig(userConfig)

      expect(merged.cliPath).toBe('/custom/path/to/cli')
    })
  })

  describe('mergeSessionConfig', () => {
    it('should use defaults when no user config provided', () => {
      const merged = mergeSessionConfig({})

      expect(merged).toMatchObject({
        projectPath: '',
        port: DEFAULT_AUTOMATION_PORT,
        timeout: DEFAULT_TIMEOUT,
        evaluateTimeout: DEFAULT_EVALUATE_TIMEOUT,
        launchTimeout: DEFAULT_LAUNCH_TIMEOUT,
        screenshotTimeout: DEFAULT_SCREENSHOT_TIMEOUT,
      })
    })

    it('should override defaults with user config', () => {
      const userConfig = {
        projectPath: '/path/to/project',
        port: 7777,
        timeout: 15000,
        evaluateTimeout: 3000,
      }

      const merged = mergeSessionConfig(userConfig)

      expect(merged.projectPath).toBe('/path/to/project')
      expect(merged.port).toBe(7777)
      expect(merged.timeout).toBe(15000)
      expect(merged.evaluateTimeout).toBe(3000)
      // Other fields should still have defaults
      expect(merged.launchTimeout).toBe(DEFAULT_LAUNCH_TIMEOUT)
      expect(merged.screenshotTimeout).toBe(DEFAULT_SCREENSHOT_TIMEOUT)
    })

    it('should use platform-specific CLI path if not provided', () => {
      const merged = mergeSessionConfig({})

      if (process.platform === 'darwin') {
        expect(merged.cliPath).toBe(DEFAULT_CLI_PATH_MACOS)
      } else {
        expect(merged.cliPath).toBe('')
      }
    })

    it('should not override provided CLI path', () => {
      const userConfig = {
        cliPath: '/my/custom/cli',
      }

      const merged = mergeSessionConfig(userConfig)

      expect(merged.cliPath).toBe('/my/custom/cli')
    })

    it('should allow all timeouts to be customized', () => {
      const userConfig = {
        timeout: 60000,
        evaluateTimeout: 10000,
        launchTimeout: 120000,
        screenshotTimeout: 20000,
      }

      const merged = mergeSessionConfig(userConfig)

      expect(merged.timeout).toBe(60000)
      expect(merged.evaluateTimeout).toBe(10000)
      expect(merged.launchTimeout).toBe(120000)
      expect(merged.screenshotTimeout).toBe(20000)
    })
  })
})
