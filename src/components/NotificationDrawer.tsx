import React from 'react';
import { AppNotification } from '../types';
import { Bell, X, TrendingDown, Tag, Package, CheckCheck } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onNotificationClick: (notif: AppNotification) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onNotificationClick,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm h-full p-6 shadow-2xl border-l border-slate-100 dark:border-slate-800 flex flex-col justify-between animate-in slide-in-from-right duration-200">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                )}
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Notificações ComparaJá</h3>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
            <span>{unreadCount} não lidas</span>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Marcar lidas
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[calc(100vh-160px)] overflow-y-auto pr-1">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  onNotificationClick(notif);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                  notif.read
                    ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-70 hover:opacity-100'
                    : 'bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl text-white shrink-0 ${
                    notif.type === 'price_drop'
                      ? 'bg-emerald-500'
                      : notif.type === 'new_coupon'
                      ? 'bg-indigo-500'
                      : 'bg-amber-500'
                  }`}>
                    {notif.type === 'price_drop' && <TrendingDown className="w-4 h-4" />}
                    {notif.type === 'new_coupon' && <Tag className="w-4 h-4" />}
                    {notif.type === 'stock' && <Package className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-xs block leading-tight">
                      {notif.title}
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-snug">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block pt-1">
                      {notif.date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
