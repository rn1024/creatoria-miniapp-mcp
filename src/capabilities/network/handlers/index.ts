/**
 * Network handlers exports
 *
 * All 6 handlers are now independently implemented in this directory.
 */

export {
  mockWxMethod,
  restoreWxMethod,
  mockRequest,
  mockRequestFailure,
  restoreRequest,
  restoreAllMocks,
  type MockWxMethodArgs,
  type MockWxMethodResult,
  type RestoreWxMethodArgs,
  type RestoreWxMethodResult,
  type MockRequestArgs,
  type MockRequestResult,
  type MockRequestFailureArgs,
  type MockRequestFailureResult,
  type RestoreRequestResult,
  type RestoreAllMocksResult,
} from './network-handlers.js'
