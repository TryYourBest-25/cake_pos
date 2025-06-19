// Swagger enum constants để tránh circular dependency
export const ORDER_STATUS_VALUES = ['PROCESSING', 'CANCELLED', 'COMPLETED'] as const;
export const PAYMENT_STATUS_VALUES = ['PROCESSING', 'PAID', 'CANCELLED'] as const;
export const GENDER_VALUES = ['MALE', 'FEMALE', 'OTHER'] as const;

export type OrderStatusType = typeof ORDER_STATUS_VALUES[number];
export type PaymentStatusType = typeof PAYMENT_STATUS_VALUES[number];
export type GenderType = typeof GENDER_VALUES[number]; 