const db = require('../db');
const ExcelJS = require('exceljs');
const path = require('path');

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

        // Agregar el logo
        const logoPath = path.join(__dirname, '..', 'assets', 'IconoAlmacen.png');
        const imageId = workbook.addImage({
            filename: logoPath,
            extension: 'png',
        });

        worksheet.addImage(imageId, {
            tl: { col: 0, row: 0 },
            ext: { width: 150, height: 100 }
        });

        // Espacio para que el logo no tape el título
        worksheet.mergeCells('A6:G6');
        const titleCell = worksheet.getCell('A6');
        titleCell.value = 'Historial de Movimientos';
        titleCell.font = { size: 18, bold: true };
        titleCell.alignment = { horizontal: 'center' };

        // Mostrar rango de fechas
        worksheet.mergeCells('A7:G7');
        const rangoCell = worksheet.getCell('A7');
        rangoCell.value = `Rango: Desde ${fecha_inicio} hasta ${fecha_fin}`;
        rangoCell.font = { italic: true, size: 12 };
        rangoCell.alignment = { horizontal: 'center' };

        // Encabezados de tabla
        worksheet.columns = [
            { header: 'ID', key: 'movimiento_id', width: 10 },
            { header: 'Tipo', key: 'tipo_movimiento', width: 15 },
            { header: 'Producto', key: 'producto_nombre', width: 25 },
            { header: 'Marca', key: 'marca_nombre', width: 20 },
            { header: 'Cantidad', key: 'cantidad', width: 15 },
            { header: 'Fecha', key: 'fecha', width: 20 },
            { header: 'Usuario', key: 'usuario_nombre', width: 25 },
        ];

        // Agregar los datos
        rows.forEach(row => worksheet.addRow(row));

        // Agregar filtros en el encabezado
        worksheet.autoFilter = {
            from: {
                row: 8,
                column: 1
            },
            to: {
                row: 8,
                column: worksheet.columns.length
            }
        };

        // Estilo de encabezados
        worksheet.getRow(8).font = { bold: true };
        worksheet.getRow(8).alignment = { horizontal: 'center' };

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
