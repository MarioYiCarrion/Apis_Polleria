const db = require('../db');
const ExcelJS = require('exceljs');

// Obtener movimientos por rango de fechas
const obtenerHistorial = async (req, res) => {
    const { fecha_inicio, fecha_fin } = req.query;

    if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({ error: 'Debe proporcionar fecha_inicio y fecha_fin' });
    }

    try {
        const [rows] = await db.execute(
            `SELECT * FROM vista_historial_movimientos WHERE fecha BETWEEN ? AND ? ORDER BY fecha DESC`,
            [fecha_inicio, fecha_fin]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// Descargar Excel del historial
const descargarHistorialExcel = async (req, res) => {
    const { fecha_inicio, fecha_fin } = req.query;

    if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({ error: 'Debe proporcionar fecha_inicio y fecha_fin' });
    }

    try {
        const [rows] = await db.execute(
            `SELECT * FROM vista_historial_movimientos WHERE fecha BETWEEN ? AND ? ORDER BY fecha DESC`,
            [fecha_inicio, fecha_fin]
        );

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Historial Movimientos');

        worksheet.columns = [
            { header: 'ID', key: 'movimiento_id', width: 10 },
            { header: 'Tipo', key: 'tipo_movimiento', width: 15 },
            { header: 'Producto', key: 'producto_nombre', width: 25 },
            { header: 'Marca', key: 'marca_nombre', width: 20 },
            { header: 'Cantidad', key: 'cantidad', width: 15 },
            { header: 'Fecha', key: 'fecha', width: 20 },
            { header: 'Usuario', key: 'usuario_nombre', width: 25 },
        ];

        rows.forEach(row => worksheet.addRow(row));

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader('Content-Disposition', 'attachment; filename=historial.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error al generar Excel:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

module.exports = {
    obtenerHistorial,
    descargarHistorialExcel
};
