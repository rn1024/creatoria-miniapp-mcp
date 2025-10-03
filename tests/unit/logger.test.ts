/**
 * Unit tests for Logger
 */

import { ConsoleLogger, createLogger } from '../../src/core/logger'

describe('Logger', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  describe('ConsoleLogger', () => {
    it('should log info messages', () => {
      const logger = new ConsoleLogger('test-session')
      logger.info('Test message')

      expect(consoleErrorSpy).toHaveBeenCalled()
      const logOutput = consoleErrorSpy.mock.calls[0][0]
      expect(logOutput).toContain('INFO')
      expect(logOutput).toContain('test-session')
      expect(logOutput).toContain('Test message')
    })

    it('should log warn messages', () => {
      const logger = new ConsoleLogger('test-session')
      logger.warn('Warning message')

      expect(consoleErrorSpy).toHaveBeenCalled()
      const logOutput = consoleErrorSpy.mock.calls[0][0]
      expect(logOutput).toContain('WARN')
      expect(logOutput).toContain('Warning message')
    })

    it('should log error messages', () => {
      const logger = new ConsoleLogger('test-session')
      logger.error('Error message')

      expect(consoleErrorSpy).toHaveBeenCalled()
      const logOutput = consoleErrorSpy.mock.calls[0][0]
      expect(logOutput).toContain('ERROR')
      expect(logOutput).toContain('Error message')
    })

    it('should log debug messages', () => {
      const logger = new ConsoleLogger('test-session', undefined, { level: 'debug' })
      logger.debug('Debug message')

      expect(consoleErrorSpy).toHaveBeenCalled()
      const logOutput = consoleErrorSpy.mock.calls[0][0]
      expect(logOutput).toContain('DEBUG')
      expect(logOutput).toContain('Debug message')
    })

    it('should include context in log output', () => {
      const logger = new ConsoleLogger('test-session')
      logger.info('Test message', { key: 'value', count: 42 })

      expect(consoleErrorSpy).toHaveBeenCalled()
      const logOutput = consoleErrorSpy.mock.calls[0][0]
      expect(logOutput).toContain('Test message')
      expect(logOutput).toContain('"key":"value"')
      expect(logOutput).toContain('"count":42')
    })

    it('should include tool name if provided', () => {
      const logger = new ConsoleLogger('test-session', 'test-tool')
      logger.info('Test message')

      expect(consoleErrorSpy).toHaveBeenCalled()
      const logOutput = consoleErrorSpy.mock.calls[0][0]
      expect(logOutput).toContain('test-tool')
    })

    it('should create child logger with tool name', () => {
      const logger = new ConsoleLogger('test-session')
      const childLogger = logger.child('child-tool')

      childLogger.info('Child message')

      expect(consoleErrorSpy).toHaveBeenCalled()
      const logOutput = consoleErrorSpy.mock.calls[0][0]
      expect(logOutput).toContain('test-session')
      expect(logOutput).toContain('child-tool')
      expect(logOutput).toContain('Child message')
    })

    it('should work without session ID', () => {
      const logger = new ConsoleLogger()
      logger.info('Test message')

      expect(consoleErrorSpy).toHaveBeenCalled()
      const logOutput = consoleErrorSpy.mock.calls[0][0]
      expect(logOutput).toContain('INFO')
      expect(logOutput).toContain('Test message')
      expect(logOutput).not.toContain('[test-session]')
    })

    it('should format timestamp correctly', () => {
      const logger = new ConsoleLogger('test-session')
      logger.info('Test message')

      expect(consoleErrorSpy).toHaveBeenCalled()
      const logOutput = consoleErrorSpy.mock.calls[0][0]
      // Check for ISO 8601 timestamp format
      expect(logOutput).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('createLogger', () => {
    it('should create logger with session ID', () => {
      const logger = createLogger('test-session')
      logger.info('Test message')

      expect(consoleErrorSpy).toHaveBeenCalled()
      const logOutput = consoleErrorSpy.mock.calls[0][0]
      expect(logOutput).toContain('test-session')
    })
  })
})
