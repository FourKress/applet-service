import { JsonObject } from '../../common/interfaces/json-object.interface';

export interface JwtPayload extends JsonObject {
  /** Issuer (如果定义了token发行者 (iss)，将根据此值进行验证) */
  iss?: string;
  /** Subject (whom the token refers to) */
  sub?: string;
  /** Audience (如果定义，token受众 (aud) 将根据此值进行验证。) */
  aud?: string[];
  /** Issued at (发行时间 seconds since Unix epoch) */
  iat?: number;
  /** Expiration time (到期时间 seconds since Unix epoch) */
  exp?: number;
  /** Authorization party (授权方 the party to which this token was issued) */
  azp?: string;
  /** Token scope (token可以访问的内容) */
  scope?: string;
}
