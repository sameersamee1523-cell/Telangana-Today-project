/**
 * Report Controller
 * Generate, list, and export daily/weekly/monthly reports
 * Supports PDF (pdfkit) and Excel (exceljs) export
 * Telangana Today - Pipeline Server
 */

const PDFDocument = require('pdfkit');
const ExcelJS    = require('exceljs');
const pool       = require('../config/db');
const { generateAuditLog, getClientIp, formatDate } = require('../utils/helpers');

// Primary brand color
const BRAND_COLOR = '#E11D48';

// ---------------------------------------------------------------
// Helper: Gather report data for a given date range
// ---------------------------------------------------------------
const collectReportData = async (startDate, endDate) => {
  // Story statistics
  const [storyStats] = await pool.query(
    `SELECT
       status,
       priority,
       COUNT(*) AS count
     FROM stories
     WHERE created_at BETWEEN ? AND ?
     GROUP BY status, priority`,
    [startDate, endDate]
  );

  // Reporter performance
  const [reporterPerf] = await pool.query(
    `SELECT
       u.id, u.name,
       COUNT(s.id)                 AS total,
       SUM(s.status='published')   AS published,
       SUM(s.status='rejected')    AS rejected,
       SUM(s.status='in_progress') AS in_progress
     FROM users u
     LEFT JOIN stories s ON s.reporter_id = u.id
       AND s.created_at BETWEEN ? AND ?
     WHERE u.role = 'reporter' AND u.is_active = 1
     GROUP BY u.id
     ORDER BY published DESC`,
    [startDate, endDate]
  );

  // Category breakdown
  const [categoryBreakdown] = await pool.query(
    `SELECT c.name, c.color, COUNT(s.id) AS count
     FROM categories c
     LEFT JOIN stories s ON s.category_id = c.id
       AND s.created_at BETWEEN ? AND ?
     GROUP BY c.id
     ORDER BY count DESC`,
    [startDate, endDate]
  );

  // Summary totals
  const [[summary]] = await pool.query(
    `SELECT
       COUNT(*)                           AS total_stories,
       SUM(status='published')            AS published,
       SUM(status='rejected')             AS rejected,
       SUM(status='in_progress')          AS in_progress,
       SUM(status IN ('submitted','under_review')) AS pending,
       SUM(priority='urgent')             AS urgent_count
     FROM stories
     WHERE created_at BETWEEN ? AND ?`,
    [startDate, endDate]
  );

  return { storyStats, reporterPerf, categoryBreakdown, summary };
};

// ---------------------------------------------------------------
// POST /api/reports/generate
// ---------------------------------------------------------------
const generateReport = async (req, res, next) => {
  try {
    const { type, period_start, period_end } = req.body;

    if (!type || !period_start || !period_end) {
      return res.status(400).json({
        success: false,
        message: 'type, period_start, and period_end are required.'
      });
    }

    const validTypes = ['daily','weekly','monthly','custom'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: `Invalid report type. Use: ${validTypes.join(', ')}` });
    }

    const data = await collectReportData(period_start, period_end);

    const [result] = await pool.query(
      `INSERT INTO reports (type, period_start, period_end, data, generated_by)
       VALUES (?, ?, ?, ?, ?)`,
      [type, period_start, period_end, JSON.stringify(data), req.user.id]
    );

    await generateAuditLog({
      userId:     req.user.id,
      action:     'GENERATE_REPORT',
      entityType: 'report',
      entityId:   result.insertId,
      details:    { type, period_start, period_end },
      ipAddress:  getClientIp(req)
    });

    const [report] = await pool.query('SELECT * FROM reports WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Report generated successfully.',
      report: report[0]
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// GET /api/reports
// List all generated reports
// ---------------------------------------------------------------
const getReports = async (req, res, next) => {
  try {
    const [reports] = await pool.query(
      `SELECT r.id, r.type, r.period_start, r.period_end, r.created_at,
              u.name AS generated_by_name, u.email AS generated_by_email
       FROM reports r
       JOIN users u ON r.generated_by = u.id
       ORDER BY r.created_at DESC
       LIMIT 50`
    );

    return res.status(200).json({ success: true, reports });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// GET /api/reports/:id/export?format=pdf|excel
// Export a report as PDF or Excel
// ---------------------------------------------------------------
const exportReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { format = 'pdf' } = req.query;

    const [rows] = await pool.query(
      `SELECT r.*, u.name AS generated_by_name
       FROM reports r JOIN users u ON r.generated_by = u.id
       WHERE r.id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    const report = rows[0];
    const data   = typeof report.data === 'string' ? JSON.parse(report.data) : report.data;

    // ---- PDF Export ----
    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="report-${id}.pdf"`);
      doc.pipe(res);

      // Header stripe
      doc.rect(0, 0, doc.page.width, 80).fill(BRAND_COLOR);

      // Newspaper name
      doc.fillColor('white')
         .fontSize(22)
         .font('Helvetica-Bold')
         .text('TELANGANA TODAY', 50, 20);

      doc.fillColor('white')
         .fontSize(11)
         .font('Helvetica')
         .text('Reporter Assignment & Story Pipeline Manager', 50, 48);

      doc.moveDown(3);

      // Report title
      doc.fillColor('#111827')
         .fontSize(18)
         .font('Helvetica-Bold')
         .text(`${report.type.toUpperCase()} REPORT`, { align: 'center' });

      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#6B7280')
         .text(`Period: ${report.period_start} to ${report.period_end}`, { align: 'center' });

      doc.text(`Generated by: ${report.generated_by_name} | ${formatDate(report.created_at)}`, { align: 'center' });

      doc.moveDown(1.5);

      // Divider
      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke(BRAND_COLOR);
      doc.moveDown(1);

      // Summary section
      const { summary } = data;
      doc.fillColor('#111827').fontSize(14).font('Helvetica-Bold').text('Executive Summary');
      doc.moveDown(0.5);

      const summaryRows = [
        ['Total Stories Created', summary.total_stories || 0],
        ['Published',             summary.published || 0],
        ['Pending Review',        summary.pending || 0],
        ['Rejected',              summary.rejected || 0],
        ['Urgent Priority',       summary.urgent_count || 0],
      ];

      summaryRows.forEach(([label, value]) => {
        doc.fillColor('#374151').fontSize(11).font('Helvetica')
           .text(`  ${label}:`, { continued: true, width: 250 })
           .fillColor(BRAND_COLOR).font('Helvetica-Bold')
           .text(` ${value}`);
      });

      doc.moveDown(1.5);

      // Reporter Performance
      if (data.reporterPerf && data.reporterPerf.length) {
        doc.fillColor('#111827').fontSize(14).font('Helvetica-Bold').text('Reporter Performance');
        doc.moveDown(0.5);

        // Table header
        const colX = [50, 200, 295, 365, 420];
        const headers = ['Reporter Name', 'Total', 'Published', 'Rejected', 'In Progress'];
        doc.fillColor('white');
        doc.rect(50, doc.y, doc.page.width - 100, 20).fill('#374151');
        const rowY = doc.y - 20;
        headers.forEach((h, i) => {
          doc.fillColor('white').fontSize(9).font('Helvetica-Bold').text(h, colX[i], rowY + 5, { width: 100 });
        });
        doc.moveDown(0.3);

        data.reporterPerf.forEach((r, idx) => {
          const bg = idx % 2 === 0 ? '#F9FAFB' : 'white';
          doc.rect(50, doc.y, doc.page.width - 100, 18).fill(bg);
          const y = doc.y - 18;
          const vals = [r.name, r.total, r.published, r.rejected, r.in_progress];
          vals.forEach((v, i) => {
            doc.fillColor('#111827').fontSize(9).font('Helvetica').text(String(v || 0), colX[i], y + 4, { width: 100 });
          });
          doc.moveDown(0.15);
        });

        doc.moveDown(1);
      }

      // Category Breakdown
      if (data.categoryBreakdown && data.categoryBreakdown.length) {
        doc.fillColor('#111827').fontSize(14).font('Helvetica-Bold').text('Category Breakdown');
        doc.moveDown(0.5);

        data.categoryBreakdown.forEach(c => {
          doc.fillColor('#374151').fontSize(11).font('Helvetica')
             .text(`  ${c.name}:`, { continued: true, width: 250 })
             .fillColor(BRAND_COLOR).font('Helvetica-Bold')
             .text(` ${c.count} stories`);
        });
      }

      // Footer
      doc.fontSize(9).fillColor('#9CA3AF').font('Helvetica')
         .text(
           `Telangana Today | Pipeline Report | Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
           50,
           doc.page.height - 40,
           { align: 'center', width: doc.page.width - 100 }
         );

      doc.end();
      return;
    }

    // ---- Excel Export ----
    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Telangana Today Pipeline';
      workbook.created = new Date();

      // ----- Sheet 1: Summary -----
      const summarySheet = workbook.addWorksheet('Summary', {
        views: [{ showGridLines: true }]
      });

      // Header row styling
      const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE11D48' } };
      const headerFont = { name: 'Calibri', bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
      const titleFont  = { name: 'Calibri', bold: true, size: 14, color: { argb: 'FF111827' } };

      summarySheet.mergeCells('A1:D1');
      summarySheet.getCell('A1').value = 'TELANGANA TODAY - STORY PIPELINE REPORT';
      summarySheet.getCell('A1').font  = { name: 'Calibri', bold: true, size: 16, color: { argb: 'FFE11D48' } };
      summarySheet.getCell('A1').alignment = { horizontal: 'center' };

      summarySheet.mergeCells('A2:D2');
      summarySheet.getCell('A2').value = `Period: ${report.period_start} to ${report.period_end} | Type: ${report.type}`;
      summarySheet.getCell('A2').alignment = { horizontal: 'center' };

      summarySheet.addRow([]);

      // Summary table
      const sumRow = summarySheet.addRow(['Metric', 'Value']);
      sumRow.getCell(1).fill = headerFill;
      sumRow.getCell(1).font = headerFont;
      sumRow.getCell(2).fill = headerFill;
      sumRow.getCell(2).font = headerFont;

      const { summary } = data;
      const summaryData = [
        ['Total Stories',   summary.total_stories || 0],
        ['Published',       summary.published || 0],
        ['Pending Review',  summary.pending || 0],
        ['In Progress',     summary.in_progress || 0],
        ['Rejected',        summary.rejected || 0],
        ['Urgent Stories',  summary.urgent_count || 0],
      ];

      summaryData.forEach(([label, val]) => {
        summarySheet.addRow([label, val]);
      });

      summarySheet.getColumn(1).width = 25;
      summarySheet.getColumn(2).width = 15;

      // ----- Sheet 2: Reporter Performance -----
      const reporterSheet = workbook.addWorksheet('Reporter Performance');

      const rpHeaders = reporterSheet.addRow(['Reporter Name', 'Total Stories', 'Published', 'In Progress', 'Rejected']);
      rpHeaders.eachCell(cell => {
        cell.fill = headerFill;
        cell.font = headerFont;
        cell.alignment = { horizontal: 'center' };
      });

      (data.reporterPerf || []).forEach(r => {
        reporterSheet.addRow([
          r.name,
          r.total        || 0,
          r.published    || 0,
          r.in_progress  || 0,
          r.rejected     || 0
        ]);
      });

      ['A','B','C','D','E'].forEach(col => {
        reporterSheet.getColumn(col).width = 20;
      });

      // ----- Sheet 3: Category Breakdown -----
      const catSheet = workbook.addWorksheet('Category Breakdown');

      const catHeaders = catSheet.addRow(['Category', 'Story Count']);
      catHeaders.eachCell(cell => {
        cell.fill = headerFill;
        cell.font = headerFont;
      });

      (data.categoryBreakdown || []).forEach(c => {
        catSheet.addRow([c.name, c.count || 0]);
      });

      catSheet.getColumn('A').width = 25;
      catSheet.getColumn('B').width = 15;

      // Send Excel file
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="report-${id}.xlsx"`);

      await workbook.xlsx.write(res);
      return res.end();
    }

    return res.status(400).json({ success: false, message: 'Invalid format. Use "pdf" or "excel".' });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateReport, getReports, exportReport };
