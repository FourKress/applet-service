import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 参数装饰器
 * 将token中的用户信息提取出来
 */
export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
