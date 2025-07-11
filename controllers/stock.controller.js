const ExcelJS = require('exceljs');
const db = require('../db');
const fs = require('fs');
const path = require('path');

exports.getAll = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT         
        s.producto_id,
        p.nombre AS producto_nombre,
        s.marca_id,
        m.nombre AS marca_nombre,
        s.cantidad,
        u.nombre AS unidad_nombre
      FROM stock s
      JOIN producto p ON s.producto_id = p.id
      JOIN marca m ON s.marca_id = m.id
      JOIN unidadmedida u ON p.unidad_medida_id = u.id
    `);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.exportStockToExcel = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT         
        s.producto_id,
        p.nombre AS producto_nombre,
        s.marca_id,
        m.nombre AS marca_nombre,
        s.cantidad,
        u.nombre AS unidad_nombre
      FROM stock s
      JOIN producto p ON s.producto_id = p.id
      JOIN marca m ON s.marca_id = m.id
      JOIN unidadmedida u ON p.unidad_medida_id = u.id
    `);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Stock Actual');

    // Logo
    const logoPath = path.join(__dirname, '../assets/IconoAlmacen.png');
    if (fs.existsSync(logoPath)) {
      const imageId = workbook.addImage({
        filename: logoPath,
        extension: 'png'
      });

      worksheet.addImage(imageId, {
        tl: { col: 4.5, row: 0.2 },
        ext: { width: 120, height: 50 }
      });
    }

    // Título
    worksheet.mergeCells('A1:D1');
    const title = worksheet.getCell('A1');
    title.value = 'Reporte de Stock Actual';
    title.font = { size: 16, bold: true };
    title.alignment = { vertical: 'middle', horizontal: 'center' };

    // Subtítulo
    const fecha = new Date().toLocaleDateString('es-PE');
    worksheet.mergeCells('A2:D2');
    const subtitle = worksheet.getCell('A2');
    subtitle.value = `Generado el ${fecha} - Almacén Pollería`;
    subtitle.font = { italic: true, size: 12, color: { argb: 'FF555555' } };
    subtitle.alignment = { vertical: 'middle', horizontal: 'center' };

    // ENCABEZADOS EN FILA 3
    const headers = ['Producto', 'Marca', 'Cantidad', 'Unidad de Medida'];
    worksheet.getRow(3).values = headers;

    // Estilos para encabezado
    const headerRow = worksheet.getRow(3);
    headerRow.height = 25;
    headerRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2F75B5' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Filtros activados
    worksheet.autoFilter = {
      from: 'A3',
      to: 'D3'
    };

    // Insertar datos desde fila 4
    results.forEach(row => {
      const newRow = worksheet.addRow([
        row.producto_nombre,
        row.marca_nombre,
        row.cantidad,
        row.unidad_nombre
      ]);

      newRow.eachCell(cell => {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Anchos de columna
    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 15;
    worksheet.getColumn(4).width = 20;

    worksheet.getColumn(3).numFmt = '0';

    // Enviar Excel
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=stock_actual.xlsx');

    await workbook.xlsx.write(res);
    res.status(200).end();

  } catch (error) {
    console.error('❌ Error al generar el Excel:', error.message);
    res.status(500).json({ message: 'Error al generar el archivo Excel', error: error.message });
  }
};









exports.getById = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM stock WHERE id = ?', [req.params.id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'No encontrado' });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const [result] = await db.query('INSERT INTO stock SET ?', [req.body]);
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    await db.query('UPDATE stock SET ? WHERE id = ?', [req.body, req.params.id]);
    res.json({ message: 'Actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM stock WHERE id = ?', [req.params.id]);
    res.json({ message: 'Eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

