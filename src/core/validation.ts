/**
 * Input validation utilities
 */

/**
 * Validates a filename to prevent path traversal attacks
 *
 * Rules:
 * - No path separators (/ or \)
 * - No parent directory references (..)
 * - Only alphanumeric, underscore, hyphen, and dot
 * - Must have a valid extension
 *
 * @param filename - The filename to validate
 * @param allowedExtensions - Array of allowed extensions (without dot)
 * @throws Error if filename is invalid
 *
 * @example
 * ```typescript
 * validateFilename('screenshot.png', ['png', 'jpg']) // OK
 * validateFilename('../etc/passwd', ['png']) // throws
 * validateFilename('file/path.png', ['png']) // throws
 * ```
 */
export function validateFilename(
  filename: string,
  allowedExtensions: string[] = ['png', 'jpg', 'jpeg', 'json', 'txt']
): void {
  if (!filename || filename.trim() === '') {
    throw new Error('Filename cannot be empty')
  }

  // Check for path traversal attempts
  if (filename.includes('..')) {
    throw new Error('Filename must not contain ".." sequences (path traversal attempt)')
  }

  // Check for path separators
  if (filename.includes('/') || filename.includes('\\')) {
    throw new Error('Filename must not contain path separators')
  }

  // Check for null bytes (security)
  if (filename.includes('\0')) {
    throw new Error('Filename must not contain null bytes')
  }

  // Validate format: alphanumeric, underscore, hyphen, and dot
  if (!/^[a-zA-Z0-9_.-]+$/.test(filename)) {
    throw new Error(
      'Filename must only contain alphanumeric characters, underscores, hyphens, and dots'
    )
  }

  // Check extension
  const parts = filename.split('.')
  if (parts.length < 2) {
    throw new Error('Filename must have an extension')
  }

  const extension = parts[parts.length - 1].toLowerCase()
  if (!allowedExtensions.includes(extension)) {
    throw new Error(
      `Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`
    )
  }

  // Check length (防止过长文件名)
  if (filename.length > 255) {
    throw new Error('Filename is too long (max 255 characters)')
  }
}

/**
 * Sanitizes a filename by removing or replacing invalid characters
 *
 * @param filename - The filename to sanitize
 * @param defaultExtension - Default extension if none provided
 * @returns A safe filename
 *
 * @example
 * ```typescript
 * sanitizeFilename('my file!.png') // 'my-file.png'
 * sanitizeFilename('test', 'json') // 'test.json'
 * ```
 */
export function sanitizeFilename(filename: string, defaultExtension?: string): string {
  // Remove path components
  filename = filename.split('/').pop()!
  filename = filename.split('\\').pop()!

  // Remove or replace invalid characters
  filename = filename.replace(/[^a-zA-Z0-9_.-]/g, '-')

  // Remove multiple consecutive hyphens or dots
  filename = filename.replace(/[-]{2,}/g, '-')
  filename = filename.replace(/[.]{2,}/g, '.')

  // Ensure extension
  if (defaultExtension && !filename.includes('.')) {
    filename = `${filename}.${defaultExtension}`
  }

  // Limit length
  if (filename.length > 255) {
    const parts = filename.split('.')
    const ext = parts.pop()
    const name = parts.join('.').substring(0, 255 - ext!.length - 1)
    filename = `${name}.${ext}`
  }

  return filename
}
