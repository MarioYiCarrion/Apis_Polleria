const db = require('../db');
const ExcelJS = require('exceljs');
const path = require('path');

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

        // Insertar el logo
        const logoPath = path.join(__dirname, '..', 'assets', 'IconoAlmacen.png');
        const imageId = workbook.addImage({
            filename: logoPath,
            extension: 'png',
        });
        worksheet.addImage(imageId, {
            tl: { col: 0, row: 0 },
            ext: { width: 120, height: 80 }
        });

        // Espacio visual
        worksheet.addRow([]);
        worksheet.addRow([]);
        worksheet.addRow([]);
        worksheet.addRow([]);
        worksheet.addRow([]);

        // Título
        worksheet.mergeCells('A6:G6');
        const titleCell = worksheet.getCell('A6');
        titleCell.value = 'Historial de Movimientos';
        titleCell.font = { size: 20, bold: true, color: { argb: '002060' } }; // Azul oscuro
        titleCell.alignment = { horizontal: 'center' };

        // Rango de fechas
        worksheet.mergeCells('A7:G7');
        const rangoCell = worksheet.getCell('A7');
        rangoCell.value = `Rango: Desde ${fecha_inicio} hasta ${fecha_fin}`;
        rangoCell.font = { italic: true, size: 12, color: { argb: '666666' } }; // Gris
        rangoCell.alignment = { horizontal: 'center' };

        // Espacio antes de la tabla
        worksheet.addRow([]);

        // Configurar columnas
        worksheet.columns = [
            { header: 'ID', key: 'movimiento_id', width: 10 },
            { header: 'Tipo', key: 'tipo_movimiento', width: 15 },
            { header: 'Producto', key: 'producto_nombre', width: 30 },
            { header: 'Marca', key: 'marca_nombre', width: 20 },
            { header: 'Cantidad', key: 'cantidad', width: 15 },
            { header: 'Fecha', key: 'fecha', width: 20 },
            { header: 'Usuario', key: 'usuario_nombre', width: 25 },
        ];

        // Agregar los datos
        rows.forEach(row => worksheet.addRow(row));

        // Filtros
        worksheet.autoFilter = {
            from: { row: 9, column: 1 },
            to: { row: 9, column: worksheet.columns.length }
        };

        // Estilo encabezados
        const headerRow = worksheet.getRow(9);
        headerRow.height = 25;
        headerRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFF' } }; // Blanco
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '305496' } // Azul oscuro profesional
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        });

        // Formato de filas de datos
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 9) {
                const isEven = (rowNumber % 2 === 0);
                row.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: isEven ? 'F2F2F2' : 'FFFFFF' } // Alternar blanco/gris claro
                    };
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' },
                    };
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                });
            }
        });

        // Formato para columna cantidad
        worksheet.getColumn('cantidad').numFmt = '#,##0.00';

        // Ajustar altura de filas
        worksheet.eachRow({ includeEmpty: true }, function (row) {
            row.height = 20;
        });

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader('Content-Disposition', 'attachment; filename=historial_movimientos.xlsx');

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
