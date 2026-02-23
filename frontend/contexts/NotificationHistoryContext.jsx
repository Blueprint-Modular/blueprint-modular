import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationHistoryContext = createContext();

export const NotificationHistoryProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('notification_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map(notif => {
          if (notif.pageIcon && typeof notif.pageIcon === 'string') {
            const trimmedIcon = notif.pageIcon.trim();
            if (!trimmedIcon.startsWith('<svg') || !trimmedIcon.includes('</svg>')) return { ...notif, pageIcon: null };
            if (!trimmedIcon.includes('xmlns') && !trimmedIcon.includes('viewBox') && !trimmedIcon.includes('path')) return { ...notif, pageIcon: null };
          }
          if (notif.message && typeof notif.message === 'string') {
            const trimmedMessage = notif.message.trim();
            if (trimmedMessage.startsWith('<svg') && trimmedMessage.includes('</svg>')) return { ...notif, message: 'Notification (icône invalide)' };
          }
          return notif;
        });
      }
    } catch (e) {
      console.error('Erreur lors du chargement de l\'historique des notifications:', e);
    }
    return [];
  });

  const saveToStorage = useCallback((newNotifications) => {
    try {
      const cleanedNotifications = newNotifications.map(notif => {
        if (notif.pageIcon && typeof notif.pageIcon === 'string') {
          const trimmedIcon = notif.pageIcon.trim();
          if (!trimmedIcon.startsWith('<svg') || !trimmedIcon.includes('</svg>')) return { ...notif, pageIcon: null };
          if (!trimmedIcon.includes('xmlns') && !trimmedIcon.includes('viewBox') && !trimmedIcon.includes('path')) return { ...notif, pageIcon: null };
        }
        if (notif.message && typeof notif.message === 'string') {
          const trimmedMessage = notif.message.trim();
          if (trimmedMessage.startsWith('<svg') && trimmedMessage.includes('</svg>')) return { ...notif, message: 'Notification (icône invalide)' };
        }
        return notif;
      });
      localStorage.setItem('notification_history', JSON.stringify(cleanedNotifications));
    } catch (e) {
      console.error('Erreur lors de la sauvegarde de l\'historique des notifications:', e);
    }
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => {
      const now = Date.now();
      const isDuplicate = prev.some(notif => {
        const timeDiff = now - new Date(notif.timestamp).getTime();
        const isParamSave = (notification.type || 'info') === 'success' &&
          notification.title === 'Paramètre sauvegardé' &&
          notification.pageName === 'Paramètres';
        if (isParamSave && timeDiff < 3000) {
          const notifIsParamSave = notif.type === 'success' && notif.title === 'Paramètre sauvegardé' && notif.pageName === 'Paramètres';
          return notifIsParamSave;
        }
        return (
          notif.message === notification.message &&
          notif.type === (notification.type || 'info') &&
          notif.title === (notification.title || null) &&
          notif.pageName === (notification.pageName || null) &&
          timeDiff < 5000
        );
      });
      if (isDuplicate) return prev;

      const newNotification = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        message: notification.message,
        type: notification.type || 'info',
        title: notification.title || null,
        pageName: notification.pageName || null,
        pageIcon: notification.pageIcon || null,
        level: notification.level ?? 3,
      };
      const updated = [newNotification, ...prev];
      const limited = updated.slice(0, 100);
      saveToStorage(limited);
      return limited;
    });
  }, [saveToStorage]);

  const clearHistory = useCallback(() => {
    setNotifications([]);
    saveToStorage([]);
  }, [saveToStorage]);

  const getRecentNotifications = useCallback((limit = 10) => {
    return notifications.slice(0, limit);
  }, [notifications]);

  const getUnreadCount = useCallback(() => 0, []);

  return (
    <NotificationHistoryContext.Provider
      value={{
        notifications,
        addNotification,
        clearHistory,
        getRecentNotifications,
        getUnreadCount,
      }}
    >
      {children}
    </NotificationHistoryContext.Provider>
  );
};

export const useNotificationHistory = () => {
  const context = useContext(NotificationHistoryContext);
  if (!context) {
    throw new Error('useNotificationHistory must be used within NotificationHistoryProvider');
  }
  return context;
};
