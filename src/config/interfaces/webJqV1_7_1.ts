import { HTTP_METHOD } from 'src/verification/web-jq-v-1_7_1/utils';

// Additional fields may be added in the future if necessary.
export interface WebJqV1_7_1Config {
  securityConfig: WebJqV1_7_1SecurityConfig;
  sourceConfig: WebJqV1_7_1SourceConfig;
}

export interface WebJqV1_7_1SecurityConfig {
  /**
   * List of hostnames that should not be fetched from.
   */
  blockHostnames: string[];
  /**
   * List of words that are not allowed to appear in JSON.
   */
  blockJson: string[];
  /**
   * List of words that are not allowed to appear in jq filter.
   */
  blockJq: string[];
  /**
   * Maximum allowed response size in bytes.
   */
  maxResponseSize: number;
  /**
   * Maximum number of redirects allowed during an HTTP request.
   */
  maxRedirects: number;
  /**
   * Maximum time (in milliseconds) to wait for a response before timing out.
   */
  maxResponseTimeout: number;
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
   * Maximum time (in milliseconds) to wait for a jq process to finish
   */
  jqTimeout: number;
}

export type AllowedMethods = HTTP_METHOD[] | '*';
export type AllowedEndPoints = string[] | '*';

export interface WebJqV1_7_1SourceConfig {
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

export interface JqMessage {
  jsonData: object;
  jqScheme: string;
}

export interface JqResultMessage {
  status: 'success';
  result: object;
}

export interface JqErrorMessage {
  status: 'error';
  error: string;
}
