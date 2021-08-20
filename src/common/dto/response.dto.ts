import { IResponse } from '../interfaces/response.interface';

export class ResponseError implements IResponse {
  constructor(infoMessage: string, data?: any) {
    this.success = false;
    this.message = infoMessage;
    this.data = data;
    this.code = 10100;
    console.warn(
      `${new Date().toString()} - [Response]: ${infoMessage}${
        data ? ` - ${JSON.stringify(data)}` : ''
      }`,
    );
  }
  message: string;
  data: any[];
  errorMessage: any;
  error: any;
  success: boolean;
  code: number;
}

export class ResponseSuccess implements IResponse {
  constructor(infoMessage: string, data?: any, notLog?: boolean) {
    this.success = true;
    this.message = infoMessage;
    this.data = data;
    this.code = 10000;
    if (!notLog) {
      try {
        const obfuscateRequest = JSON.parse(JSON.stringify(data));
        if (obfuscateRequest && obfuscateRequest.token) {
          obfuscateRequest.token = '*******';
        }
        console.log(
          `${new Date().toString()} - [Response]: ${JSON.stringify(
            obfuscateRequest,
          )}`,
        );
      } catch (error) {}
    }
  }
  message: string;
  data: any[];
  errorMessage: any;
  error: any;
  success: boolean;
  code: number;
}
