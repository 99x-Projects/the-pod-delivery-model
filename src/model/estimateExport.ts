import { strToU8, zipSync } from "fflate";
import {
  COMMIT_Z_85,
  COMMIT_Z_95,
  type EstimateItem,
  expectedHours,
  pointInOrder,
  rollup,
  spreadHours,
} from "./estimate";

export type EstimateExport = {
  name: string;
  manRate: number;
  podRate: number;
  items: EstimateItem[];
};

type Cell =
  | { kind: "text"; text: string; bold?: boolean }
  | { kind: "number"; value: number; format: "hours" | "money" }
  | { kind: "formula"; formula: string; value: number; format: "hours" | "money" };

const HEADERS = [
  "Work",
  "Man optimistic",
  "Man most likely",
  "Man pessimistic",
  "Man expected",
  "Man spread",
  "Pod optimistic",
  "Pod most likely",
  "Pod pessimistic",
  "Pod expected",
  "Pod spread",
  "Check",
];

/** Excel row of the first work item. Rows 1–6 are the title, rates, and headings. */
const FIRST_ITEM_ROW = 7;

export function estimateFileName(name: string) {
  const base = name
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
  return `${base || "three-point-estimate"}.xlsx`;
}

export function buildEstimateRows(sheet: EstimateExport): Cell[][] {
  const items = sheet.items.length > 0 ? sheet.items : [{ id: "empty", name: "", man: zero(), pod: zero() }];
  const first = FIRST_ITEM_ROW;
  const last = FIRST_ITEM_ROW + items.length - 1;
  const man = rollup(items.map((item) => item.man));
  const pod = rollup(items.map((item) => item.pod));
  const totals = last + 2;
  const expectedRow = totals + 2;
  const spreadRow = totals + 3;
  const commit85Row = totals + 4;
  const commit95Row = totals + 5;
  const rateRow = totals + 6;

  const rows: Cell[][] = [
    [text("Three-point estimate", true)],
    [text("Name"), text(sheet.name.trim() || "Estimate")],
    [text("Man-hour rate (NOK)"), money(sheet.manRate)],
    [text("Pod-hour rate (NOK)"), money(sheet.podRate)],
    [],
    HEADERS.map((header) => text(header, true)),
  ];

  items.forEach((item, index) => {
    const row = FIRST_ITEM_ROW + index;
    const order =
      pointInOrder(item.man) && pointInOrder(item.pod)
        ? ""
        : "Check optimistic, most likely, then pessimistic";
    rows.push([
      text(item.name.trim() || `Work ${index + 1}`),
      hours(item.man.optimistic),
      hours(item.man.likely),
      hours(item.man.pessimistic),
      formula(`(B${row}+4*C${row}+D${row})/6`, expectedHours(item.man), "hours"),
      formula(`ABS(D${row}-B${row})/6`, spreadHours(item.man), "hours"),
      hours(item.pod.optimistic),
      hours(item.pod.likely),
      hours(item.pod.pessimistic),
      formula(`(G${row}+4*H${row}+I${row})/6`, expectedHours(item.pod), "hours"),
      formula(`ABS(I${row}-G${row})/6`, spreadHours(item.pod), "hours"),
      text(order),
    ]);
  });

  rows.push([]);
  rows.push([text("Totals", true)]);
  rows.push([
    text("Most likely, added up"),
    formula(`SUM(C${first}:C${last})`, man.likely, "hours"),
    formula(`SUM(H${first}:H${last})`, pod.likely, "hours"),
  ]);
  rows.push([
    text("Expected"),
    formula(`SUM(E${first}:E${last})`, man.expected, "hours"),
    formula(`SUM(J${first}:J${last})`, pod.expected, "hours"),
  ]);
  rows.push([
    text("Spread"),
    formula(`SQRT(SUMSQ(F${first}:F${last}))`, man.spread, "hours"),
    formula(`SQRT(SUMSQ(K${first}:K${last}))`, pod.spread, "hours"),
  ]);
  rows.push([
    text("About 85%"),
    formula(`B${expectedRow}+${COMMIT_Z_85}*B${spreadRow}`, man.commit85, "hours"),
    formula(`C${expectedRow}+${COMMIT_Z_85}*C${spreadRow}`, pod.commit85, "hours"),
  ]);
  rows.push([
    text("About 95%"),
    formula(`B${expectedRow}+${COMMIT_Z_95}*B${spreadRow}`, man.commit95, "hours"),
    formula(`C${expectedRow}+${COMMIT_Z_95}*C${spreadRow}`, pod.commit95, "hours"),
  ]);
  rows.push([
    text("Rate (NOK)"),
    formula("B3", sheet.manRate, "money"),
    formula("B4", sheet.podRate, "money"),
  ]);
  rows.push([
    text("Expected price (NOK)"),
    formula(`B${expectedRow}*B${rateRow}`, man.expected * sheet.manRate, "money"),
    formula(`C${expectedRow}*C${rateRow}`, pod.expected * sheet.podRate, "money"),
  ]);
  rows.push([
    text("About 85% price (NOK)"),
    formula(`B${commit85Row}*B${rateRow}`, man.commit85 * sheet.manRate, "money"),
    formula(`C${commit85Row}*C${rateRow}`, pod.commit85 * sheet.podRate, "money"),
  ]);
  rows.push([
    text("About 95% price (NOK)"),
    formula(`B${commit95Row}*B${rateRow}`, man.commit95 * sheet.manRate, "money"),
    formula(`C${commit95Row}*C${rateRow}`, pod.commit95 * sheet.podRate, "money"),
  ]);
  rows.push([]);
  rows.push([
    text(
      "Expected hours are (optimistic + 4 × most likely + pessimistic) / 6. The spread of one line is (pessimistic − optimistic) / 6. The spread of the estimate is the square root of the sum of the squared line spreads.",
    ),
  ]);

  return rows;
}

export function estimateSheetXml(sheet: EstimateExport) {
  const rows = buildEstimateRows(sheet);
  const lastRow = rows.length;
  const body = rows
    .map((row, index) => {
      const rowNumber = index + 1;
      const cells = row
        .map((cell, column) => (cell ? renderCell(column, rowNumber, cell) : ""))
        .join("");
      return `<row r="${rowNumber}">${cells}</row>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:L${lastRow}"/>
  <cols>
    <col min="1" max="1" width="36" customWidth="1"/>
    <col min="2" max="11" width="18" customWidth="1"/>
    <col min="12" max="12" width="48" customWidth="1"/>
  </cols>
  <sheetData>${body}</sheetData>
</worksheet>`;
}

export async function downloadEstimateWorkbook(sheet: EstimateExport) {
  const file = estimateFileName(sheet.name);
  const bytes = zipSync(
    {
      "[Content_Types].xml": strToU8(CONTENT_TYPES),
      "_rels/.rels": strToU8(ROOT_RELS),
      "xl/workbook.xml": strToU8(WORKBOOK),
      "xl/_rels/workbook.xml.rels": strToU8(WORKBOOK_RELS),
      "xl/styles.xml": strToU8(STYLES),
      "xl/worksheets/sheet1.xml": strToU8(estimateSheetXml(sheet)),
    },
    { level: 6 },
  );
  const blob = new Blob([Uint8Array.from(bytes)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file;
  link.click();
  URL.revokeObjectURL(url);
}

function text(value: string, bold = false): Cell {
  return { kind: "text", text: value, bold };
}

function hours(value: number): Cell {
  return { kind: "number", value, format: "hours" };
}

function money(value: number): Cell {
  return { kind: "number", value, format: "money" };
}

function formula(formulaText: string, value: number, format: "hours" | "money"): Cell {
  return { kind: "formula", formula: formulaText, value, format };
}

function zero() {
  return { optimistic: 0, likely: 0, pessimistic: 0 };
}

function renderCell(column: number, row: number, cell: Cell) {
  const ref = `${columnName(column)}${row}`;
  if (cell.kind === "text") {
    const style = cell.bold ? ` s="3"` : "";
    return `<c r="${ref}" t="inlineStr"${style}><is><t xml:space="preserve">${escapeXml(cell.text)}</t></is></c>`;
  }
  const style = cell.format === "hours" ? ` s="1"` : ` s="2"`;
  if (cell.kind === "formula") {
    return `<c r="${ref}"${style}><f>${escapeXml(cell.formula)}</f><v>${numberText(cell.value)}</v></c>`;
  }
  return `<c r="${ref}"${style}><v>${numberText(cell.value)}</v></c>`;
}

function columnName(index: number) {
  let n = index + 1;
  let name = "";
  while (n > 0) {
    const remainder = (n - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

function numberText(value: number) {
  return Number.isFinite(value) ? String(value) : "0";
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

const ROOT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

const WORKBOOK = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Estimate" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

const WORKBOOK_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="2">
    <numFmt numFmtId="164" formatCode="0.0"/>
    <numFmt numFmtId="165" formatCode="#,##0"/>
  </numFmts>
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/></font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1">
    <border><left/><right/><top/><bottom/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="4">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
    <xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
  </cellXfs>
</styleSheet>`;
