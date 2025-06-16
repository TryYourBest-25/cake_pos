"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useUIStore } from "@/stores/ui";

export function NotificationProvider() {
  const { notifications, removeNotification } = useUIStore();

  useEffect(() => {
    // Display new notifications
    notifications.forEach((notification) => {
      const toastId = notification.id;
      
      switch (notification.type) {
        case 'success':
          toast.success(notification.title, {
            id: toastId,
            description: notification.message,
            onDismiss: () => removeNotification(notification.id),
          });
          break;
        case 'error':
          toast.error(notification.title, {
            id: toastId,
            description: notification.message,
            onDismiss: () => removeNotification(notification.id),
          });
          break;
        case 'warning':
          toast.warning(notification.title, {
            id: toastId,
            description: notification.message,
            onDismiss: () => removeNotification(notification.id),
          });
          break;
        case 'info':
          toast.info(notification.title, {
            id: toastId,
            description: notification.message,
            onDismiss: () => removeNotification(notification.id),
          });
          break;
      }
      
      // Remove from store after showing
      removeNotification(notification.id);
    });
  }, [notifications, removeNotification]);

  return null; // This component doesn't render anything
} 