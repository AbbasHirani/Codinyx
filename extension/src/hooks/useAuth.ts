import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSession } from "@/store/session";

export function useAuth() {
  const { token, setToken } = useSession(useShallow((s) => ({ token: s.token, setToken: s.setToken })));

  useEffect(() => {
    chrome.storage.local.get("token", (r) => {
      setToken(r.token ?? null);
    });
  }, [setToken]);

  return { token, isLoggedIn: !!token };
}
