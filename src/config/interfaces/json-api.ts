import { HTTP_METHOD } from 'src/verification/json-api/utils';

export interface IJsonApiConfig { // TODO check if all fields are needed
  securityConfig: IJsonApiSecurityConfig;
  sourceConfig: IJsonApiSourceConfig;
}

export interface IJsonApiSecurityConfig {
  blockHostnames: string[];
  blockJson: string[];
  blockJq: string[];
  jqVersion: string;
}

export type AllowedMethods = HTTP_METHOD[] | "*";
export type AllowedEndPoints = string[] | "*";

export interface IJsonApiSourceConfig {
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
  maxTimeout: number;
  /**
   * Authentication details required for accessing the source. The structure may vary based on the authentication method.
   */
  authentication?: { [key: string]: unknown };
}