import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Package,
  Clock,
  CreditCard,
  RotateCcw,
  XCircle,
  CheckCircle2,
  Trash2,
  RefreshCw,
  ArrowRight,
  Filter,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { notificationService } from '@/services/notificationService';
import { NotificationRecord, NotificationType } from '@/types';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface NotificationCenterProps {
  onSelectBooking?: (bookingId: string) => void;
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  onSelectBooking,
  className,
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  const loadNotifications = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const res = await notificationService.getCustomerNotifications(user.id);
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user?.id) return;
    await notificationService.markAsRead(notificationId, user.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    await notificationService.markAllAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setFeedbackMessage('All notifications marked as read.');
    setTimeout(() => setFeedbackMessage(''), 3000);
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!user?.id) return;
    await notificationService.deleteNotification(notificationId, user.id);
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'unread') return !n.is_read;
    return true;
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'payment_status':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'reschedule':
        return <RotateCcw className="w-4 h-4 text-aqua-600" />;
      case 'cancellation':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      case 'booking_status':
      default:
        return <Package className="w-4 h-4 text-navy-600" />;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ice-200 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ice-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ice-100 text-aqua-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Bell className="w-3.5 h-3.5 text-aqua-600" />
              <span>Customer Activity Updates</span>
            </div>
            <h2 className="font-poppins font-bold text-xl sm:text-2xl text-navy-900">
              Notification Center
            </h2>
            <p className="text-xs sm:text-sm text-darkNavy/70 mt-0.5">
              Real-time updates on your laundry bookings, pickups, and payments in Kasur City.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleMarkAllAsRead}
                className="gap-1.5 text-xs font-semibold text-navy-700"
                leftIcon={<CheckCheck className="w-3.5 h-3.5 text-aqua-600" />}
              >
                Mark All as Read
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={loadNotifications}
              isLoading={isLoading}
              className="text-xs text-navy-600"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {feedbackMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Filters Strip */}
        <div className="flex items-center justify-between gap-4 pt-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all',
                filterType === 'all'
                  ? 'bg-navy-500 text-white shadow-soft'
                  : 'bg-ice-50 text-darkNavy/80 hover:bg-ice-100'
              )}
            >
              <span>All Notifications</span>
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {notifications.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('unread')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all relative',
                filterType === 'unread'
                  ? 'bg-navy-500 text-white shadow-soft'
                  : 'bg-ice-50 text-darkNavy/80 hover:bg-ice-100'
              )}
            >
              <span>Unread</span>
              {unreadCount > 0 ? (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-aqua-400 text-darkNavy font-extrabold">
                  {unreadCount}
                </span>
              ) : (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-ice-200 text-darkNavy/60">
                  0
                </span>
              )}
            </button>
          </div>

          <span className="text-[11px] text-darkNavy/50 hidden sm:inline">
            Kasur Doorstep Service Alerts
          </span>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white rounded-3xl p-12 border border-ice-200 text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-500 mx-auto"></div>
            <p className="text-xs text-darkNavy/60">Loading your notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-ice-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-ice-100 text-navy-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-aqua-600" />
            </div>
            <h3 className="font-poppins font-bold text-base text-navy-900">
              {filterType === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </h3>
            <p className="text-xs text-darkNavy/60 max-w-sm mx-auto leading-relaxed">
              {filterType === 'unread'
                ? 'You have read all of your notifications. Great job!'
                : 'When you book a laundry pickup in Kasur or your order status changes, your real-time alerts will appear here.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const isUnread = !n.is_read;
            return (
              <div
                key={n.id}
                className={cn(
                  'bg-white rounded-2xl p-4 sm:p-5 border transition-all space-y-3',
                  isUnread
                    ? 'border-aqua-300 ring-1 ring-aqua-200/80 bg-aqua-50/20 shadow-soft'
                    : 'border-ice-200 hover:border-ice-300'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                        isUnread ? 'bg-aqua-100 ring-2 ring-aqua-200' : 'bg-ice-100'
                      )}
                    >
                      {getNotificationIcon(n.notification_type)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-poppins font-bold text-sm text-navy-900">
                          {n.title}
                        </h4>
                        {isUnread && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-aqua-400 text-darkNavy">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-darkNavy/80 font-inter leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[11px] text-darkNavy/50 block">
                        {new Date(n.created_at).toLocaleDateString('en-PK', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Top-Right Quick Dismiss */}
                  <button
                    type="button"
                    onClick={() => handleDeleteNotification(n.id)}
                    className="text-darkNavy/30 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                    title="Dismiss notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Bottom Action Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-ice-100 text-xs">
                  <div className="flex items-center gap-2">
                    {n.booking_id && onSelectBooking && (
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => {
                          if (isUnread) handleMarkAsRead(n.id);
                          onSelectBooking(n.booking_id!);
                        }}
                        className="gap-1 font-semibold text-navy-700 hover:text-aqua-600"
                      >
                        <span>View Booking Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  {isUnread && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(n.id)}
                      className="text-xs font-semibold text-navy-600 hover:text-aqua-600 py-1 px-2.5 rounded-lg hover:bg-ice-100 transition-colors"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

