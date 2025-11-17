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

export interface Web2JsonSource {
  /** Unique identifier for the source. Must be alphanumeric and fit into Solidity's `bytes32. */
  sourceId: string;
  /** List of allowed endpoints for this source. */
  endpoints: Endpoint[];
}

export interface Endpoint {
  /**
   * DNS host only. Can optionally include a port, but no protocol.
   * Wildcards are not allowed.
   *
   * E.g. `api.example.com` or `api.example.com:8080`.
   */
  host: string;
  /**
   * Allowed paths for this host. Use `"*"` to allow any path, or an array of specific paths.
   *
   * E.g. `["/v1/foo", "/v1/bar"]`.
   */
  paths: string[] | '*';
  methods: AllowedMethods;
  /** Authentication details for this endpoint, if required. */
  auth?: EndpointAuth;
}

/**
 * Authentication details for an endpoint.
 * Either `header` or `query` must be specified to indicate how to pass the secret.
 */
export interface EndpointAuth {
  type: AuthType;
  /** Name of the header field to pass the secret, if applicable. */
  header?: string;
  /** Name of the query parameter to pass the secret, if applicable. */
  query?: string;
  /** Name of the environment variable that holds the secret at runtime. */
  env?: string;
}

export enum AuthType {
  BEARER = 'bearer',
  APIKEY = 'apikey',
}
