import { DocPage, DocH1, DocH2, DocH3, DocLead, DocP, DocUl, DocLi, CodeBlock, DocTable, Note, Warning } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/reference/csv" headings={[
      { id: "roster", label: "Roster import CSV", depth: 2 },
      { id: "questions", label: "Question import CSV", depth: 2 },
      { id: "exports", label: "Export formats", depth: 2 },
    ]}>
      <DocH1>CSV formats</DocH1>
      <DocLead>Reference for every CSV file ExamPro reads or writes — exact column names, required fields, and example rows.</DocLead>

      <DocH2 id="roster">Roster import CSV</DocH2>
      <DocP>Used in <strong>Dashboard → Import</strong> to bulk-create invite records.</DocP>
      <CodeBlock lang="csv">{`name,email,role,className,externalId
Amara Okafor,amara@school.edu.ng,student,Grade 10,S001
Tunde Adeyemi,tunde@school.edu.ng,student,Grade 11,S002
Mrs. Kemi Fasola,kemi@school.edu.ng,teacher,,T001`}</CodeBlock>
      <DocTable
        headers={["Column", "Required", "Values"]}
        rows={[
          ["name", "✓", "Full name string"],
          ["email", "✓", "Valid email — must match registration email exactly"],
          ["role", "✓", "student | teacher | parent | manager"],
          ["className", "For students", "Must exactly match a class name in Structure"],
          ["externalId", "—", "Your own reference ID (e.g. student number) — optional"],
        ]}
      />
      <Warning>Column names are case-sensitive. The first row must be the header row exactly as shown.</Warning>

      <DocH2 id="questions">Question import CSV</DocH2>
      <DocP>Used in <strong>Dashboard → Questions → Import CSV</strong>.</DocP>
      <CodeBlock lang="csv">{`type,text,subject,className,points,options,correctIndex,correctBool,acceptedAnswers,explanation
mcq,What does HTTP stand for?,Computer Science,Grade 10,2,HyperText Transfer Protocol|Hypertext Transport Protocol|High Transfer Text Protocol|Hyper Type Transfer Protocol,0,,,"HTTP = HyperText Transfer Protocol"
truefalse,Python is a compiled language.,Computer Science,Grade 10,1,,,,false,Python is interpreted
short,What is the capital of Nigeria?,Geography,Grade 9,1,,,,Abuja,"Abuja became capital in 1991"`}</CodeBlock>
      <DocTable
        headers={["Column", "Required for"]}
        rows={[
          ["type", "All — mcq | truefalse | short | essay | coding | project"],
          ["text", "All"],
          ["subject", "All"],
          ["className", "All"],
          ["points", "All"],
          ["options", "MCQ only — 4 options separated by |"],
          ["correctIndex", "MCQ only — 0, 1, 2, or 3"],
          ["correctBool", "TF only — true or false"],
          ["acceptedAnswers", "Short only — pipe-separated"],
          ["explanation", "Optional for all"],
        ]}
      />

      <DocH2 id="exports">Export formats</DocH2>
      <DocH3 id="results-export">Results export</DocH3>
      <CodeBlock lang="csv">{`studentName,studentEmail,assessmentTitle,subject,className,kind,score,maxScore,percent,passed,status,attemptNumber,submittedAt`}</CodeBlock>

      <DocH3 id="roster-export">Roster export</DocH3>
      <CodeBlock lang="csv">{`name,email,role,className,status,createdAt`}</CodeBlock>

      <DocH3 id="questions-export">Question bank export</DocH3>
      <CodeBlock lang="csv">{`type,subject,className,topic,skill,text,points,options,correctIndex,correctBool,acceptedAnswers,explanation`}</CodeBlock>
      <Note>All dates in exports are ISO 8601 strings in UTC (e.g. <code className="bg-white/8 px-1 rounded text-xs">2026-05-08T09:30:00.000Z</code>).</Note>
    </DocPage>
  );
}
