import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { AuthGuard, IAuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // 在这里取metadata中的no-auth，得到的会是一个bool
    const noAuth = this.reflector.get<boolean>('no-auth', context.getHandler());
    if (noAuth) {
      return true;
    }
    const guard = JwtAuthGuard.getAuthGuard();
    return guard.canActivate(context); // 执行所选策略Guard的canActivate方法
  }

  // 根据NoAuth的t/f选择合适的策略Guard
  private static getAuthGuard(): IAuthGuard {
    return new (AuthGuard('jwt'))();
  }
}
