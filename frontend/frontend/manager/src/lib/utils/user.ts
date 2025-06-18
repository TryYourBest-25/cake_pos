import { User } from "@/stores/auth";

/**
 * Lấy tên hiển thị của user
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return "Khách";

  // Ưu tiên lấy từ manager/employee/customer profile
  if (user.manager) {
    return `${user.manager.first_name} ${user.manager.last_name}`.trim();
  }

  if (user.employee) {
    return `${user.employee.first_name} ${user.employee.last_name}`.trim();
  }

  if (user.customer && user.customer.length > 0) {
    const firstCustomer = user.customer[0];
    return `${firstCustomer.first_name} ${firstCustomer.last_name}`.trim();
  }

  // Fallback về username
  return user.username;
}

/**
 * Lấy email của user
 */
export function getUserEmail(user: User | null): string | null {
  if (!user) return null;

  if (user.manager) return user.manager.email;
  if (user.employee) return user.employee.email;
  if (user.customer && user.customer.length > 0) {
    return user.customer[0].email;
  }

  return null;
}

/**
 * Lấy số điện thoại của user
 */
export function getUserPhone(user: User | null): string | null {
  if (!user) return null;

  if (user.manager) return user.manager.phone;
  if (user.employee) return user.employee.phone;
  if (user.customer && user.customer.length > 0) {
    return user.customer[0].phone;
  }

  return null;
}

/**
 * Kiểm tra user có bị khóa không
 */
export function isUserLocked(user: User | null): boolean {
  return user?.is_locked || false;
}

/**
 * Kiểm tra user có active không
 */
export function isUserActive(user: User | null): boolean {
  return user?.is_active !== false;
}

/**
 * Lấy role name
 */
export function getUserRole(user: User | null): string {
  return user?.role?.name || "UNKNOWN";
} 