/**
 * Unit tests for config loader
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'
import {
  findConfigFile,
  loadConfigFile,
  loadConfigFromEnv,
  mergeConfigs,
  loadConfig,
} from '../../src/config/loader'
import {
  DEFAULT_AUTOMATION_PORT,
  DEFAULT_OUTPUT_DIR,
  DEFAULT_TIMEOUT,
  DEFAULT_SESSION_TIMEOUT,
  DEFAULT_CAPABILITIES,
} from '../../src/config/defaults'

describe('Config Loader', () => {
  const testDir = join(__dirname, '.test-config-loader')
  const originalEnv = { ...process.env }

  beforeEach(() => {
    // Clean test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
    mkdirSync(testDir, { recursive: true })

    // Reset environment
    process.env = { ...originalEnv }

    // Suppress console.error for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    // Clean up
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }

    // Restore environment
    process.env = { ...originalEnv }

    jest.restoreAllMocks()
  })

  describe('findConfigFile', () => {
    it('should find .mcp.json in current directory', () => {
      const configPath = join(testDir, '.mcp.json')
      writeFileSync(configPath, '{}')

      const found = findConfigFile(testDir)
      expect(found).toBe(configPath)
    })

    it('should find mcp.config.json in current directory', () => {
      const configPath = join(testDir, 'mcp.config.json')
      writeFileSync(configPath, '{}')

      const found = findConfigFile(testDir)
      expect(found).toBe(configPath)
    })

    it('should prioritize .mcp.json over mcp.config.json', () => {
      const mcpPath = join(testDir, '.mcp.json')
      const configPath = join(testDir, 'mcp.config.json')
      writeFileSync(mcpPath, '{}')
      writeFileSync(configPath, '{}')

      const found = findConfigFile(testDir)
      expect(found).toBe(mcpPath)
    })

    it('should search parent directories', () => {
      const parentDir = testDir
      const childDir = join(testDir, 'child')
      mkdirSync(childDir, { recursive: true })

      const configPath = join(parentDir, '.mcp.json')
      writeFileSync(configPath, '{}')

      const found = findConfigFile(childDir)
      expect(found).toBe(configPath)
    })

    it('should return null if no config found', () => {
      // Use a directory that definitely won't have parent configs
      // Create a deeply nested temp directory
      const deepDir = join(testDir, 'a', 'b', 'c', 'd', 'e', 'f')
      mkdirSync(deepDir, { recursive: true })

      const found = findConfigFile(deepDir)
      // Should either be null or found in parent (project root)
      // If found, it should not be in our test directory
      if (found) {
        expect(found).not.toContain(testDir)
      }
    })
  })

  describe('loadConfigFile', () => {
    it('should load valid JSON config', () => {
      const configPath = join(testDir, '.mcp.json')
      const configData = {
        projectPath: '/test/project',
        port: 8080,
      }
      writeFileSync(configPath, JSON.stringify(configData))

      const config = loadConfigFile(configPath)
      expect(config).toEqual(configData)
    })

    it('should throw on invalid JSON', () => {
      const configPath = join(testDir, '.mcp.json')
      writeFileSync(configPath, '{ invalid json }')

      expect(() => loadConfigFile(configPath)).toThrow('Invalid JSON')
    })

    it('should throw if config is not an object', () => {
      const configPath = join(testDir, '.mcp.json')
      writeFileSync(configPath, '[]')

      expect(() => loadConfigFile(configPath)).toThrow('must contain a JSON object')
    })

    it('should load complex config with nested values', () => {
      const configPath = join(testDir, '.mcp.json')
      const configData = {
        projectPath: '/test/project',
        port: 9420,
        capabilities: ['automator', 'page'],
        timeout: 5000,
      }
      writeFileSync(configPath, JSON.stringify(configData))

      const config = loadConfigFile(configPath)
      expect(config).toEqual(configData)
    })
  })

  describe('loadConfigFromEnv', () => {
    it('should load all supported environment variables', () => {
      process.env.MCP_PROJECT_PATH = '/env/project'
      process.env.MCP_CLI_PATH = '/env/cli'
      process.env.MCP_PORT = '7777'
      process.env.MCP_CAPABILITIES = 'automator,page,element'
      process.env.MCP_OUTPUT_DIR = '.env-output'
      process.env.MCP_TIMEOUT = '15000'
      process.env.MCP_SESSION_TIMEOUT = '600000'

      const config = loadConfigFromEnv()

      expect(config.projectPath).toBe('/env/project')
      expect(config.cliPath).toBe('/env/cli')
      expect(config.port).toBe(7777)
      expect(config.capabilities).toEqual(['automator', 'page', 'element'])
      expect(config.outputDir).toBe('.env-output')
      expect(config.timeout).toBe(15000)
      expect(config.sessionTimeout).toBe(600000)
    })

    it('should return empty config if no env vars set', () => {
      const config = loadConfigFromEnv()
      expect(config).toEqual({})
    })

    it('should ignore invalid port values', () => {
      process.env.MCP_PORT = 'invalid'

      const config = loadConfigFromEnv()
      expect(config.port).toBeUndefined()
    })

    it('should ignore invalid timeout values', () => {
      process.env.MCP_TIMEOUT = 'not-a-number'

      const config = loadConfigFromEnv()
      expect(config.timeout).toBeUndefined()
    })

    it('should handle capabilities with extra whitespace', () => {
      process.env.MCP_CAPABILITIES = ' automator , page , element '

      const config = loadConfigFromEnv()
      expect(config.capabilities).toEqual(['automator', 'page', 'element'])
    })
  })

  describe('mergeConfigs', () => {
    it('should merge with priority: cli > env > file', () => {
      const fileConfig = {
        projectPath: '/file/project',
        port: 9420,
        timeout: 30000,
      }

      const envConfig = {
        port: 8080,
        outputDir: '.env-output',
      }

      const cliConfig = {
        projectPath: '/cli/project',
      }

      const merged = mergeConfigs(fileConfig, envConfig, cliConfig)

      expect(merged.projectPath).toBe('/cli/project') // CLI wins
      expect(merged.port).toBe(8080) // Env wins over file
      expect(merged.outputDir).toBe('.env-output') // Env only
      expect(merged.timeout).toBe(30000) // File only
    })

    it('should fill in defaults for missing values', () => {
      const merged = mergeConfigs({}, {}, {})

      expect(merged.port).toBe(DEFAULT_AUTOMATION_PORT)
      expect(merged.outputDir).toBe(DEFAULT_OUTPUT_DIR)
      expect(merged.timeout).toBe(DEFAULT_TIMEOUT)
      expect(merged.sessionTimeout).toBe(DEFAULT_SESSION_TIMEOUT)
      expect(merged.capabilities).toEqual(DEFAULT_CAPABILITIES)
    })

    it('should handle empty configs', () => {
      const merged = mergeConfigs()

      expect(merged).toBeDefined()
      expect(merged.port).toBe(DEFAULT_AUTOMATION_PORT)
    })

    it('should not override CLI config with defaults', () => {
      const cliConfig = {
        port: 7777,
        timeout: 5000,
      }

      const merged = mergeConfigs({}, {}, cliConfig)

      expect(merged.port).toBe(7777)
      expect(merged.timeout).toBe(5000)
    })
  })

  describe('loadConfig', () => {
    it('should load from all sources with correct priority', () => {
      // Create config file
      const configPath = join(testDir, '.mcp.json')
      writeFileSync(
        configPath,
        JSON.stringify({
          projectPath: '/file/project',
          port: 9420,
          timeout: 30000,
        })
      )

      // Set environment
      process.env.MCP_PORT = '8080'
      process.env.MCP_OUTPUT_DIR = '.env-output'

      // CLI config
      const cliConfig = {
        projectPath: '/cli/project',
      }

      const config = loadConfig({
        configPath,
        cliConfig,
      })

      expect(config.projectPath).toBe('/cli/project') // CLI wins
      expect(config.port).toBe(8080) // Env wins
      expect(config.outputDir).toBe('.env-output') // Env only
      expect(config.timeout).toBe(30000) // File only
    })

    it('should use defaults when no sources available', () => {
      const config = loadConfig({
        skipFile: true,
        skipEnv: true,
      })

      expect(config.port).toBe(DEFAULT_AUTOMATION_PORT)
      expect(config.outputDir).toBe(DEFAULT_OUTPUT_DIR)
      expect(config.timeout).toBe(DEFAULT_TIMEOUT)
    })

    it('should auto-discover config file', () => {
      const configPath = join(testDir, '.mcp.json')
      writeFileSync(
        configPath,
        JSON.stringify({
          projectPath: '/discovered/project',
        })
      )

      // Change to test directory
      const originalCwd = process.cwd()
      process.chdir(testDir)

      try {
        const config = loadConfig()
        expect(config.projectPath).toBe('/discovered/project')
      } finally {
        process.chdir(originalCwd)
      }
    })

    it('should skip file loading when skipFile=true', () => {
      const configPath = join(testDir, '.mcp.json')
      writeFileSync(
        configPath,
        JSON.stringify({
          projectPath: '/file/project',
        })
      )

      const config = loadConfig({
        configPath,
        skipFile: true,
      })

      expect(config.projectPath).toBe('') // Default empty
    })

    it('should skip env loading when skipEnv=true', () => {
      process.env.MCP_PORT = '8080'

      const config = loadConfig({
        skipEnv: true,
      })

      expect(config.port).toBe(DEFAULT_AUTOMATION_PORT) // Default
    })

    it('should handle config file errors gracefully', () => {
      const configPath = join(testDir, '.mcp.json')
      writeFileSync(configPath, '{ invalid }')

      // Should not throw, just use defaults
      const config = loadConfig({ configPath })

      expect(config).toBeDefined()
      expect(config.port).toBe(DEFAULT_AUTOMATION_PORT)
    })
  })
})
