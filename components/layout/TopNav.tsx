"use client";

import { signOut } from "next-auth/react";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TopNavProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export function TopNav({ user }: TopNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="h-14 border-b border-[var(--card-border)] bg-[var(--background)] flex items-center justify-end px-6 sticky top-0 z-10">
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          {user.image ? (
            <img src={user.image} className="w-7 h-7 rounded-full" alt="" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[var(--primary)] flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
          )}
          <span className="text-sm font-medium">{user.name ?? user.email}</span>
          <ChevronDown className={cn("w-3.5 h-3.5 text-[var(--muted)] transition-transform", open && "rotate-180")} />
        </button>

        {open && (
          <div className="absolute right-0 mt-1 w-48 rounded-lg border border-[var(--card-border)] bg-[var(--card)] shadow-xl overflow-hidden z-20">
            <div className="px-4 py-3 border-b border-[var(--card-border)]">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-[var(--muted)] truncate">{user.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--error)] hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
