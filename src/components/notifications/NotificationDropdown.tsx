"use client";

import { LocaleLink } from "@/components/LocaleLink";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CheckCircle,
  AlertCircle,
  ImageIcon,
  Bell,
} from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

const typeIcons: Record<string, typeof Bell> = {
  gallery_approved: ImageIcon,
  gallery_rejected: AlertCircle,
  issue_status_changed: CheckCircle,
};

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `${minutes}د`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}س`;
  const days = Math.floor(hours / 24);
  return `${days}ي`;
}

export function NotificationDropdown({
  open,
  onOpenChange,
  onUnreadCountChange,
  trigger,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnreadCountChange: (count: number) => void;
  trigger: ReactNode;
}) {
  const { t } = useTranslation("common");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=20");
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.notifications ?? []);
        onUnreadCountChange(json.unreadCount ?? 0);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [onUnreadCountChange]);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read_all" }),
      });
      if (res.ok) {
        const json = await res.json();
        onUnreadCountChange(json.unreadCount ?? 0);
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true })),
        );
      }
    } catch {
      // Ignore
    }
  };

  const markOneAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read_one", notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch {
      // Ignore
    }
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">
            {t("nav.notifications")}
          </h3>
          {hasUnread && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-[#7f0df2] hover:underline"
            >
              {t("buttons.clearAll")}
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {t("messages.loading")}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              {t("messages.noResults")}
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = typeIcons[notification.type] ?? Bell;
              const content = (
                <div
                  className={`flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer ${
                    !notification.read ? "bg-[#7f0df2]/5" : ""
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      markOneAsRead(notification.id);
                    }
                    onOpenChange(false);
                  }}
                >
                  <div
                    className={`mt-0.5 shrink-0 ${
                      !notification.read
                        ? "text-[#7f0df2]"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-snug ${
                        !notification.read ? "font-medium" : ""
                      }`}
                    >
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="mt-2 shrink-0">
                      <div className="w-2 h-2 rounded-full bg-[#7f0df2]" />
                    </div>
                  )}
                </div>
              );

              if (notification.link) {
                return (
                  <LocaleLink
                    key={notification.id}
                    href={notification.link}
                    className="block"
                  >
                    {content}
                  </LocaleLink>
                );
              }

              return <div key={notification.id}>{content}</div>;
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
