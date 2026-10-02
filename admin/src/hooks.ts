import { useCallback, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore/lite";
import { db, watchUser } from "./firebase";
import { getToken, setToken, whoAmI, type GitHubRole } from "./github";

export type StaffRole = "admin" | "publisher" | "editor";
export type StaffState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "denied"; user: User; reason: string }
  | { status: "ready"; user: User; email: string; role: StaffRole };

/**
 * Who is signed in to the lead tools, and their role from the staff list. The
 * role only shapes the interface; firestore.rules enforces it on every read
 * and write.
 */
export function useStaff(): StaffState {
  const [state, setState] = useState<StaffState>({ status: "loading" });
  useEffect(() => watchUser(async (user) => {
    if (!user) return setState({ status: "signed-out" });
    const email = (user.email ?? "").toLowerCase();
    if (!email || !user.emailVerified) return setState({ status: "denied", user, reason: "This Google account has no verified email address." });
    try {
      const snap = await getDoc(doc(db, "staff", email));
      const data = snap.data() as { role?: StaffRole; active?: boolean } | undefined;
      if (!snap.exists() || !data?.active || !data.role)
        return setState({ status: "denied", user, reason: `${email} is not on the staff list. Ask an administrator to add you.` });
      setState({ status: "ready", user, email, role: data.role });
    } catch {
      setState({ status: "denied", user, reason: `${email} is not on the staff list, or access was removed. Ask an administrator.` });
    }
  }), []);
  return state;
}

export type GitHubState =
  | { status: "disconnected" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; login: string; name: string | null; avatar: string; role: GitHubRole };

export function useGitHub() {
  const [state, setState] = useState<GitHubState>(() => (getToken() ? { status: "loading" } : { status: "disconnected" }));
  const refresh = useCallback(async () => {
    if (!getToken()) return setState({ status: "disconnected" });
    setState({ status: "loading" });
    try {
      const me = await whoAmI();
      setState({ status: "ready", login: me.login, name: me.name, avatar: me.avatar_url, role: me.role });
    } catch (error) {
      if ((error as { status?: number }).status === 401) setToken(null);
      setState({ status: "error", message: error instanceof Error ? error.message : String(error) });
    }
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load from the stored session token
  useEffect(() => { void refresh(); }, [refresh]);
  const connect = useCallback(async (token: string) => { setToken(token); await refresh(); }, [refresh]);
  const disconnect = useCallback(() => { setToken(null); setState({ status: "disconnected" }); }, []);
  return { state, refresh, connect, disconnect };
}
