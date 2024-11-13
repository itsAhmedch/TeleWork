import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector,
    
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());


    if (!roles) {
      return true; // No roles, so access is allowed
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
 

    if (!user || !user.role) {
      return false; // No user or role, so deny access
    }

    return roles.includes(user.role); // Check if user role is in the allowed roles
  }
}
