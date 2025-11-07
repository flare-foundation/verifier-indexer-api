export interface Web2JsonConfig {
  securityParams: Web2JsonSecurityParams;
  sources: Web2JsonSource[];
}

export interface Web2JsonSecurityParams {
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
   * Maximum allowed length of the ABI signature.
   */
  maxAbiSignatureLength: number;
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
export type AllowedEndpoints = string[] | '*';

export interface Web2JsonSource {
  sourceId: string;
  endpoints: Endpoint[];
}

export interface Endpoint {
  host: string;
  paths: AllowedEndpoints;
  methods: AllowedMethods;
  auth?: EndpointAuth;
}

export interface EndpointAuth {
  type: AuthType;
  header?: string;
  keyEnvVar?: string;
}

export enum AuthType {
  BEARER = 'bearer',
  APIKEY = 'apikey',
}
