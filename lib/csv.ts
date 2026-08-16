export interface RosterRow {
  name: string;
  email: string;
  className: string;
  externalId?: string;
  role: "student" | "teacher" | "parent" | "manager";
  department?: string;
  parentEmail?: string;
}

export function parseCsvMaps(text: string): Record<string, string>[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map(headerKey);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const map: Record<string, string> = {};
    headers.forEach((h, idx) => {
      map[h] = (cols[idx] ?? "").trim();
    });
    rows.push(map);
  }
  return rows;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim());
  return out;
}

function headerKey(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const NAME_KEYS = ["name", "fullname", "studentname", "learner"];
const EMAIL_KEYS = ["email", "mail", "e-mail"];
const CLASS_KEYS = [
  "class",
  "classname",
  "cohort",
  "grade",
  "level",
  "group",
  "track",
  "batch",
];
const ID_KEYS = ["id", "externalid", "studentid", "admissionno", "regno"];
const ROLE_KEYS = ["role"];
const DEPT_KEYS = ["department", "dept", "faculty"];
const PARENT_KEYS = ["parentemail", "guardianemail", "parent"];

function pick(map: Record<string, string>, keys: string[]): string {
  for (const k of keys) {
    if (map[k]) return map[k];
  }
  return "";
}

export function parseRosterCsv(text: string): {
  rows: RosterRow[];
  errors: string[];
} {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) {
    return { rows: [], errors: ["CSV needs a header row and at least one person."] };
  }
  const headers = splitCsvLine(lines[0]).map(headerKey);
  const rows: RosterRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const map: Record<string, string> = {};
    headers.forEach((h, idx) => {
      map[h] = (cols[idx] ?? "").trim();
    });
    const name = pick(map, NAME_KEYS);
    const email = pick(map, EMAIL_KEYS).toLowerCase();
    const className = pick(map, CLASS_KEYS);
    const externalId = pick(map, ID_KEYS) || undefined;
    const department = pick(map, DEPT_KEYS) || undefined;
    const parentEmail = pick(map, PARENT_KEYS).toLowerCase() || undefined;
    const roleRaw = pick(map, ROLE_KEYS).toLowerCase();
    let role: RosterRow["role"] = "student";
    if (roleRaw.includes("teach") || roleRaw.includes("instruct") || roleRaw.includes("lectur")) {
      role = "teacher";
    } else if (roleRaw.includes("parent") || roleRaw.includes("guardian")) {
      role = "parent";
    } else if (roleRaw.includes("manager")) {
      role = "manager";
    }
    if (!email || !email.includes("@")) {
      errors.push(`Row ${i + 1}: missing a valid email.`);
      continue;
    }
    if (!name) {
      errors.push(`Row ${i + 1}: missing a name.`);
      continue;
    }
    rows.push({
      name,
      email,
      className,
      externalId,
      role,
      department,
      parentEmail,
    });
  }
  return { rows, errors };
}

export function rosterTemplateCsv(): string {
  return [
    "name,email,class,id,role,department,parentEmail",
    "Ada Okonkwo,ada@school.edu,Cohort 12,STU-001,student,Engineering,parent@email.com",
    "Chidi Bello,chidi@school.edu,Cohort 12,STU-002,student,Engineering,",
    "Ngozi Eze,ngozi@school.edu,Cohort 12,,teacher,Engineering,",
  ].join("\n");
}

export function toCsv(headers: string[], rows: (string | number | undefined)[][]): string {
  const esc = (v: string | number | undefined) => {
    const s = v === undefined || v === null ? "" : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return [headers.join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
