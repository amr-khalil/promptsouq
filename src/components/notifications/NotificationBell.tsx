"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { NotificationDropdown } from "./NotificationDropdown";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async () => {
      try {
        const res = await fetch("/api/notifications/count");
        if (res.ok && !cancelled) {
          const json = await res.json();
          setUnreadCount(json.unreadCount ?? 0);
        }
      } catch {
        // Ignore
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <NotificationDropdown
      open={open}
      onOpenChange={setOpen}
      onUnreadCountChange={setUnreadCount}
      trigger={
        <button
          className="relative flex items-center justify-center w-10 h-10 rounded-full border border-zinc-700 text-zinc-400 hover:text-white hover:border-[#7f0df2] hover:shadow-[0_0_15px_#7f0df2] transition-all"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -end-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      }
    />
  );
}
