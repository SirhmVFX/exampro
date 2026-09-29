"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "./firebase";
import {
  waitForUserProfile,
  getInstitution,
  listMembershipsForUser,
  ensureMembership,
  switchActiveInstitution,
  recordAttendance,
} from "./db";
import type { Institution, Membership, UserProfile } from "./types";

const STORAGE_KEY = (uid: string) => `exampro:activeInstitution:${uid}`;
// Once-per-day guard so refreshes/tabs don't hammer the attendance write.
const ATTENDED_KEY = (uid: string) =>
  `exampro:attended:${uid}:${new Date().toISOString().slice(0, 10)}`;

export interface OrgOption {
  membership: Membership;
  institution: Institution | null;
}

interface AuthState {
  firebaseUser: User | null;
  profile: UserProfile | null;
  institution: Institution | null;
  memberships: Membership[];
  orgs: OrgOption[];
  loading: boolean;
  switching: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  switchOrg: (institutionId: string) => Promise<UserProfile>;
}

const AuthContext = createContext<AuthState>({
  firebaseUser: null,
  profile: null,
  institution: null,
  memberships: [],
  orgs: [],
  loading: true,
  switching: false,
  refresh: async () => {},
  logout: async () => {},
  switchOrg: async () => {
    throw new Error("Not signed in");
  },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [orgs, setOrgs] = useState<OrgOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const loadGen = useRef(0);

  // Attendance: the first dashboard session of the day records presence.
  // Fire-and-forget — a failed write must never block the app.
  const markAttendance = useCallback((p: UserProfile) => {
    if (p.role !== "student") return;
    try {
      if (localStorage.getItem(ATTENDED_KEY(p.uid))) return;
      localStorage.setItem(ATTENDED_KEY(p.uid), "1");
    } catch {
      /* private mode — just write */
    }
    recordAttendance(p.institutionId, p).catch(() => {
      try {
        localStorage.removeItem(ATTENDED_KEY(p.uid));
      } catch {
        /* ignore */
      }
    });
  }, []);

  const loadData = useCallback(
    async (user: User | null) => {
      const gen = ++loadGen.current;
      setLoading(true);
      try {
        if (!user) {
          if (gen === loadGen.current) {
            setProfile(null);
            setInstitution(null);
            setMemberships([]);
            setOrgs([]);
          }
          return;
        }
        let p = await waitForUserProfile(user.uid);
        if (gen !== loadGen.current) return;
        if (!p) {
          setProfile(null);
          setInstitution(null);
          setMemberships([]);
          setOrgs([]);
          return;
        }

        let mems = await listMembershipsForUser(p.uid);
        if (!mems.length) {
          await ensureMembership(p);
          mems = await listMembershipsForUser(p.uid);
        }
        if (gen !== loadGen.current) return;

        // p is non-null here — we returned early above if it was null
        const nonNullP = p as NonNullable<typeof p>;

        const activeOk = mems.some(
          (m) =>
            m.institutionId === nonNullP.institutionId && m.status === "active",
        );
        if (!activeOk) {
          let stored: string | null = null;
          try {
            stored = localStorage.getItem(STORAGE_KEY(nonNullP.uid));
          } catch {
            stored = null;
          }
          const preferred =
            (stored
              ? mems.find(
                  (m) => m.institutionId === stored && m.status === "active",
                )
              : null) ??
            mems.find((m) => m.status === "active") ??
            mems[0];
          if (preferred) {
            p = await switchActiveInstitution(p.uid, preferred.institutionId);
          }
        }
        try {
          localStorage.setItem(STORAGE_KEY(p!.uid), p!.institutionId);
        } catch {
          /* ignore */
        }

        const insts = await Promise.all(
          mems.map(async (m) => ({
            membership: m,
            institution: await getInstitution(m.institutionId),
          })),
        );
        if (gen !== loadGen.current) return;

        const inst = await getInstitution(p.institutionId);
        if (gen !== loadGen.current) return;
        setProfile(p);
        setInstitution(inst);
        setMemberships(mems);
        setOrgs(insts);
        markAttendance(p as NonNullable<typeof p>);
      } finally {
        if (gen === loadGen.current) setLoading(false);
      }
    },
    [markAttendance],
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      await loadData(user);
    });
    return unsub;
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData(auth.currentUser);
  }, [loadData]);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const switchOrg = useCallback(
    async (institutionId: string) => {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("Not signed in");
      setSwitching(true);
      try {
        const next = await switchActiveInstitution(uid, institutionId);
        try {
          localStorage.setItem(STORAGE_KEY(uid), institutionId);
        } catch {
          /* ignore */
        }
        await loadData(auth.currentUser);
        return next;
      } finally {
        setSwitching(false);
      }
    },
    [loadData],
  );

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        institution,
        memberships,
        orgs,
        loading,
        switching,
        refresh,
        logout,
        switchOrg,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function dashboardPathForRole(role: string): string {
  if (role === "admin") return "/dashboard/admin";
  if (role === "teacher") return "/dashboard/teacher";
  if (role === "parent") return "/dashboard/parent";
  if (role === "manager") return "/dashboard/manager";
  return "/dashboard/student";
}

export function postAuthPath(
  profile: UserProfile,
  institution: Institution | null,
): string {
  if (profile.status === "suspended") return "/auth/suspended";
  if (profile.role === "admin" && (!institution || !institution.onboarded)) {
    return "/onboarding";
  }
  return dashboardPathForRole(profile.role);
}
