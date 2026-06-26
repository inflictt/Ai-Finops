// import PDFDocument from "pdfkit";

// export function makePdf(markdown) {
//   return new Promise((resolve, reject) => {
//     // Create a new PDF
//     const doc = new PDFDocument({
//       size: "A4",
//       margin: 50,
//     });

//     // Store PDF data here
//     const chunks = [];

//     // Every time PDFKit generates data, save it
//     doc.on("data", (chunk) => {
//       chunks.push(chunk);
//     });

//     // If something goes wrong
//     doc.on("error", (err) => {
//       reject(err);
//     });

//     // When PDF generation finishes
//     doc.on("end", () => {
//       const pdfBuffer = Buffer.concat(chunks);
//       resolve(pdfBuffer);
//     });

//     // Write the content
//     doc.fontSize(20).text("AI FinOps Report");
//     doc.moveDown();
//     doc.fontSize(12).text(markdown);
//     // Finish the PDF
//     doc.end();
//   });
// }
console.log("Pdf in making");

import PDFDocument from "pdfkit";
// --- colours ---
const PURPLE = "#4A3FB0";
const INK = "#14130F";
const MUTE = "#5F5E5A";
const BAND = "#F2EFE7";

// remove markdown symbols we render as styling (not as characters)
const strip = (s) => s.replace(/\*\*/g, "").replace(/`/g, "");

// split "text **bold** more" into runs so bold actually renders bold
function parseRuns(text) {
  const runs = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) runs.push({ text: text.slice(last, m.index), bold: false });
    runs.push({ text: m[1], bold: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) runs.push({ text: text.slice(last), bold: false });
  return runs.length ? runs : [{ text, bold: false }];
}

// draw one line, supporting **bold**, optionally as a bullet
function drawInline(doc, text, { size = 11, color = INK, bullet = false } = {}) {
  doc.fontSize(size).fillColor(color);
  if (bullet) doc.font("Helvetica").text("•  ", { continued: true, indent: 12 });
  const runs = parseRuns(text);
  runs.forEach((r, i) => {
    doc
      .font(r.bold ? "Helvetica-Bold" : "Helvetica")
      .fillColor(color)
      .text(r.text, { continued: i < runs.length - 1 });
  });
}

// draw a markdown table as a real table: purple header + zebra rows
function drawTable(doc, rows) {
  const left = doc.page.margins.left;
  const usableW = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const cols = rows[0].length;
  const colW = usableW / cols;
  const rowH = 22;

  rows.forEach((row, r) => {
    if (doc.y + rowH > doc.page.height - doc.page.margins.bottom) doc.addPage();
    const y = doc.y;
    if (r === 0) doc.rect(left, y, usableW, rowH).fill(PURPLE);
    else if (r % 2 === 1) doc.rect(left, y, usableW, rowH).fill(BAND);

    row.forEach((cell, c) => {
      doc
        .font(r === 0 ? "Helvetica-Bold" : "Helvetica")
        .fontSize(9.5)
        .fillColor(r === 0 ? "#FFFFFF" : INK)
        .text(strip(cell), left + c * colW + 6, y + 6, {
          width: colW - 12,
          ellipsis: true,
          lineBreak: false,
        });
    });
    doc.y = y + rowH;
  });
  doc.x = left;
  doc.moveDown(0.6);
}

export function makePdf(markdown) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    // branded eyebrow at the top
    doc.font("Helvetica-Bold").fontSize(9).fillColor(MUTE)
      .text("AI FINOPS · COST INTELLIGENCE", { characterSpacing: 1.5 });
    doc.moveDown(0.5);

    const lines = markdown.split("\n");
    let i = 0;
    while (i < lines.length) {
      const t = lines[i].trim();

      if (!t) { doc.moveDown(0.4); i++; continue; }

      // ---- table block ----
      if (t.startsWith("|")) {
        const block = [];
        while (i < lines.length && lines[i].trim().startsWith("|")) { block.push(lines[i]); i++; }
        const rows = block
          .map((line) => {
            const cells = line.split("|").map((c) => c.trim());
            if (cells[0] === "") cells.shift();
            if (cells[cells.length - 1] === "") cells.pop();
            return cells;
          })
          .filter((cells) => !cells.every((c) => /^[-:]*$/.test(c))); // drop the |---| line
        if (rows.length) drawTable(doc, rows);
        continue;
      }

      // ---- headings ----
      if (t.startsWith("# ")) {
        doc.moveDown(0.2).font("Helvetica-Bold").fontSize(22).fillColor(PURPLE).text(strip(t.slice(2)));
        const y = doc.y + 2;
        doc.moveTo(doc.page.margins.left, y).lineTo(doc.page.width - doc.page.margins.right, y)
          .lineWidth(1).strokeColor(PURPLE).stroke();
        doc.moveDown(0.6);
      } else if (t.startsWith("## ")) {
        doc.moveDown(0.5).font("Helvetica-Bold").fontSize(14).fillColor(INK).text(strip(t.slice(3)));
        doc.moveDown(0.2);
      } else if (t.startsWith("### ")) {
        doc.moveDown(0.3).font("Helvetica-Bold").fontSize(12).fillColor(INK).text(strip(t.slice(4)));
      } else if (/^[-*]\s/.test(t)) {
        drawInline(doc, t.slice(2), { size: 10.5, bullet: true });
        doc.moveDown(0.15);
      } else {
        drawInline(doc, t, { size: 11 });
        doc.moveDown(0.3);
      }
      i++;
    }

    doc.end();
  });
}