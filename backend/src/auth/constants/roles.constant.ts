/**
 * Role constants - phải khớp với role names trong database
 */
export const ROLES = {
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

/**
 * Role hierarchy - role cao hơn có thể thực hiện hành động của role thấp hơn
 */
export const ROLE_HIERARCHY: Record<RoleType, RoleType[]> = {
  [ROLES.MANAGER]: [ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER],
  [ROLES.STAFF]: [ROLES.STAFF, ROLES.CUSTOMER],
  [ROLES.CUSTOMER]: [ROLES.CUSTOMER],
};
