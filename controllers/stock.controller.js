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

    // === 1. Insertar logo (E1:F3)
    const logoPath = path.join(__dirname, '../assets/IconoAlmacen.png');
    if (!fs.existsSync(logoPath)) {
      console.error('Logo no encontrado:', logoPath);
      return res.status(500).json({ message: 'Logo no encontrado' });
    }

    const imageId = workbook.addImage({
      filename: logoPath,
      extension: 'png'
    });

    worksheet.addImage(imageId, {
      tl: { col: 4.5, row: 0.2 },
      ext: { width: 120, height: 50 }
    });

    // === 2. Insertar título en A1:D1
    worksheet.mergeCells('A1:D1');
    worksheet.getCell('A1').value = 'Reporte de Stock Actual';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

    // === 3. Subtítulo en A2:D2
    const fecha = new Date().toLocaleDateString('es-PE');
    worksheet.mergeCells('A2:D2');
    worksheet.getCell('A2').value = `Generado el ${fecha} - Almacén Pollería`;
    worksheet.getCell('A2').font = { italic: true, size: 12, color: { argb: 'FF555555' } };
    worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };

    // === 4. Columnas y encabezados en A3:D3
    worksheet.columns = [
      { header: 'Producto', key: 'producto_nombre', width: 30 },
      { header: 'Marca', key: 'marca_nombre', width: 20 },
      { header: 'Cantidad', key: 'cantidad', width: 15 },
      { header: 'Unidad de Medida', key: 'unidad_nombre', width: 20 }
    ];

    // === 5. Estilos para encabezados (fila 3)
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

    // === 6. Filtros activados
    worksheet.autoFilter = {
      from: 'A3',
      to: 'D3'
    };

    // === 7. Insertar datos desde la fila 4
    results.forEach(row => {
      const newRow = worksheet.addRow({
        producto_nombre: row.producto_nombre,
        marca_nombre: row.marca_nombre,
        cantidad: row.cantidad,
        unidad_nombre: row.unidad_nombre
      });

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

    // === 8. Preparar descarga
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=stock_actual_con_logo.xlsx');

    await workbook.xlsx.write(res);
    res.status(200).end();

  } catch (error) {
    console.error('Error al generar el Excel:', error.message);
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

