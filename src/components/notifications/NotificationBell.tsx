import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, ExternalLink, Package, Clock, CreditCard, Sparkles, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { notificationService } from '@/services/notificationService';
import { NotificationRecord } from '@/types';
import { cn } from '@/utils/cn';

interface NotificationBellProps {
  className?: string;
  showDropdown?: boolean;
  onNotificationClick?: (notification: NotificationRecord) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  className,
  showDropdown = true,
  onNotificationClick,
}) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [recentNotifications, setRecentNotifications] = useState<NotificationRecord[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnread = async () => {
    if (!user?.id) return;
    try {
      const res = await notificationService.getCustomerNotifications(user.id);
      const unread = res.notifications.filter((n) => !n.is_read);
      setUnreadCount(unread.length);
      setRecentNotifications(res.notifications.slice(0, 5));
    } catch (e) {
      console.warn('Error loading unread count:', e);
    }
  };

  useEffect(() => {
    fetchUnread();
    // Poll every 15 seconds for new notifications in foreground
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const handleMarkAsRead = async (notif: NotificationRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) return;
    await notificationService.markAsRead(notif.id, user.id);
    fetchUnread();
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    await notificationService.markAllAsRead(user.id);
    await fetchUnread();
    setIsLoading(false);
  };

  if (!user) return null;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      {showDropdown ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'relative p-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-aqua-400',
            isOpen
              ? 'bg-ice-200 text-navy-900 shadow-inner'
              : 'text-darkNavy/80 hover:bg-ice-100 hover:text-navy-900',
            className
          )}
          aria-label={`Notifications (${unreadCount} unread)`}
          aria-expanded={isOpen}
        >
          <Bell className="w-5 h-5" />

          {/* Unread Indicator Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-aqua-500 text-white text-[10px] font-extrabold shadow-sm animate-in zoom-in">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      ) : (
        <Link
          to="/account/notifications"
          className={cn(
            'relative p-2 rounded-xl text-darkNavy/80 hover:bg-ice-100 transition-colors',
            className
          )}
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-aqua-500 text-white text-[10px] font-extrabold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
      )}

      {/* Dropdown Panel */}
      {isOpen && showDropdown && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-ice-200 shadow-xl shadow-navy-900/10 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 bg-ice-50/80 border-b border-ice-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-poppins font-bold text-xs text-navy-800">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-aqua-100 text-aqua-800">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={isLoading}
                  className="text-[11px] font-medium text-navy-600 hover:text-aqua-600 flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-darkNavy/40 hover:text-darkNavy p-0.5 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-ice-100">
            {recentNotifications.length === 0 ? (
              <div className="py-8 px-4 text-center text-xs text-darkNavy/60 space-y-1">
                <Bell className="w-6 h-6 mx-auto text-ice-300" />
                <p className="font-medium text-navy-700">No notifications yet</p>
                <p className="text-[11px] text-darkNavy/50">
                  You will receive updates when you book laundry in Kasur.
                </p>
              </div>
            ) : (
              recentNotifications.map((n) => {
                const isUnread = !n.is_read;
                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (onNotificationClick) {
                        onNotificationClick(n);
                      }
                      if (isUnread) {
                        notificationService.markAsRead(n.id, user.id);
                        fetchUnread();
                      }
                      setIsOpen(false);
                    }}
                    className={cn(
                      'p-3 transition-colors cursor-pointer text-left flex items-start gap-2.5',
                      isUnread
                        ? 'bg-aqua-50/40 hover:bg-aqua-50/70 border-l-2 border-aqua-500'
                        : 'hover:bg-ice-50/60'
                    )}
                  >
                    <div
                      className={cn(
                        'w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                        isUnread ? 'bg-aqua-100 text-aqua-700' : 'bg-ice-100 text-navy-600'
                      )}
                    >
                      {n.notification_type === 'payment_status' ? (
                        <CreditCard className="w-3.5 h-3.5" />
                      ) : n.notification_type === 'reschedule' ? (
                        <Clock className="w-3.5 h-3.5" />
                      ) : (
                        <Package className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-navy-900 truncate">
                          {n.title}
                        </span>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-aqua-500 shrink-0"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-darkNavy/70 line-clamp-2 mt-0.5 leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-darkNavy/50 mt-1 block">
                        {new Date(n.created_at).toLocaleDateString('en-PK', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Link to Full Notification Center */}
          <div className="p-2.5 bg-ice-50/60 border-t border-ice-200 text-center">
            <Link
              to="/account/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-navy-600 hover:text-aqua-600 inline-flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-white transition-colors"
            >
              <span>View all notifications</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

