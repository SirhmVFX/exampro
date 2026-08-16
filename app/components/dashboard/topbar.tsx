"use client";

import { Bell, Menu, Megaphone, CheckCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { markNotificationRead, subscribeToNotifications } from "@/lib/db";
import { htmlToPlain } from "@/app/components/ui/html-content";
import type { Notification } from "@/lib/types";

interface TopbarProps {
  title: string;
  subtitle?: string;
  onMobileMenuToggle?: () => void;
}

function timeAgo(ts: number): string {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function DashboardTopbar({
  title,
  subtitle,
  onMobileMenuToggle,
}: TopbarProps) {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile) return;
    const unsub = subscribeToNotifications(
      profile.institutionId,
      { uid: profile.uid, role: profile.role },
      setNotifications
    );
    return unsub;
  }, [profile]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unread = profile
    ? notifications.filter((n) => !n.readBy.includes(profile.uid))
    : [];

  const markAllRead = async () => {
    if (!profile) return;
    await Promise.all(
      unread.map((n) => markNotificationRead(n.id, profile.uid))
    );
  };

  const initial = profile?.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden p-2 hover:bg-gray-100 transition"
          onClick={onMobileMenuToggle}
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={panelRef}>
          <button
            className="relative p-2 hover:bg-gray-100 transition"
            aria-label="Notifications"
            onClick={() => setOpen(!open)}
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unread.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 bg-black text-white text-[10px] font-bold flex items-center justify-center">
                {unread.length > 9 ? "9+" : unread.length}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-90 max-w-[90vw] bg-white border border-gray-200 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">
                  Notifications
                </p>
                {unread.length > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-gray-600 hover:text-black flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <Megaphone className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isUnread =
                      profile && !n.readBy.includes(profile.uid);
                    return (
                      <button
                        key={n.id}
                        onClick={() =>
                          profile && markNotificationRead(n.id, profile.uid)
                        }
                        className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${
                          isUnread ? "bg-gray-50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {isUnread && (
                            <span className="w-2 h-2 mt-1.5 bg-black rounded-full shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                              {htmlToPlain(n.body)}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-1">
                              {n.senderName} · {timeAgo(n.createdAt)}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-sm font-semibold">
          {initial}
        </div>
      </div>
    </header>
  );
}
