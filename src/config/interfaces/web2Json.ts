// Additional fields may be added in the future if necessary.
export interface Web2JsonConfig {
  securityConfig: Web2JsonSecurityConfig;
  sourceConfig: Web2JsonSourceConfig;
}

export interface Web2JsonSecurityConfig {
  /**
   * List of hostnames that should not be fetched from.
   */
  blockHostnames: string[];
  /**
   * List of hostnames that are allowed to be fetched from. An empty array [] means no restrictions (all hostnames are allowed).
   */
  allowedHostnames: string[];
  /**
   * Maximum allowed response size in bytes.
   */
  maxResponseSize: number;
  /**
   * Maximum number of redirects allowed during an HTTP request.
   */
  maxRedirects: number;
  /**
   * Maximum time to wait for a response before timing out.
   */
  requestTimeoutMs: number;
  /**
   * Maximum allowed length of the URL.
   */
  maxUrlLength: number;
  /**
   * Maximum allowed number of headers (max keys in headers). Depth is considered to be 1.
   */
  maxHeaders: number;
  /**
   * Maximum allowed number of query parameters (max keys in query parameters). Depth is considered to be 1.
   */
  maxQueryParams: number;
  /**
   * Maximum allowed depth of the body JSON structure.
   */
  maxBodyJsonDepth: number;
  /**
   * Maximum allowed number of keys in the body JSON object.
   */
  maxBodyJsonKeys: number;
  /**
   * Maximum allowed length of the jq filter.
   */
  maxJqFilterLength: number;
  /**
   * Response processing timeout (jq filter + ABI encoding), in milliseconds.
   */
  processingTimeoutMs: number;
}

export enum HTTP_METHOD {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export type AllowedMethods = HTTP_METHOD[] | '*';
export type AllowedEndPoints = string[] | '*';

export interface Web2JsonSourceConfig {
  /**
   * Indicates whether an API key is required to access the source.
   */
  requiresApiKey: boolean;
  /**
   * Specifies the allowed HTTP methods for requests. Can be a list of specific methods or "*" to allow all.
   */
  allowedMethods: AllowedMethods;
  /**
   * Specifies the allowed API endpoints. Can be a list of specific endpoint paths or "*" to allow all.
   */

  allowedEndPoints: AllowedEndPoints;
  /**
   * Authentication details required for accessing the source. The structure may vary based on the authentication method.
   */
  authentication?: { [key: string]: unknown };
}
