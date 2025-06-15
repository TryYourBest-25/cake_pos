import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ROLE_HIERARCHY, RoleType } from '../constants/roles.constant';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.role_name) {
      return false;
    }

    const userRole = user.role_name as RoleType;
    const allowedRoles = ROLE_HIERARCHY[userRole] || [userRole];

    // Kiểm tra xem user có role được phép thực hiện action này không
    return requiredRoles.some((requiredRole) => allowedRoles.includes(requiredRole));
  }
} 