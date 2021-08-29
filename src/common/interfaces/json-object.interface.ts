/** JSON值类型 */
export type JsonValue = string | number | boolean;

/** JSON数据类型 */
export interface JsonObject {
  [k: string]: JsonValue | JsonValue[] | JsonObject;
}