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

    // Leer imagen (logo.png)
    const logoPath = path.join(__dirname, '../assets/IconoAlmacen.png');
    const imageId = workbook.addImage({
      filename: logoPath,
      extension: 'png',
    });

    // Insertar logo (A1:B4)
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 120, height: 60 },
    });

    // Agregar título centrado en la fila 2, columna C (C2)
    worksheet.mergeCells('C2:F2');
    const titleCell = worksheet.getCell('C2');
    titleCell.value = 'Reporte de Stock Actual';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Dejar 3 filas vacías para espacio visual
    worksheet.addRow([]);
    worksheet.addRow([]);
    worksheet.addRow([]);

    // Encabezados
    worksheet.columns = [      
      { header: 'Producto', key: 'producto_nombre', width: 30 },      
      { header: 'Marca', key: 'marca_nombre', width: 20 },
      { header: 'Cantidad', key: 'cantidad', width: 15 },
      { header: 'Unidad de Medida', key: 'unidad_nombre', width: 20 }
    ];

    // Filtros automáticos
    worksheet.autoFilter = {
      from: 'A6',
      to: 'D6'
    };

    // Estilo para encabezados
    const headerRow = worksheet.getRow(6);
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

    // Insertar datos debajo del encabezado
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

    worksheet.getRow(6).height = 25;

    // Enviar Excel
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=stock_actual_con_logo.xlsx');

    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (error) {
    console.error('Error al generar el Excel:', error);
    res.status(500).json({ message: 'Error al generar el archivo Excel' });
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

