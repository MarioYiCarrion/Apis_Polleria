const express = require('express');
const app = express();
require('dotenv').config();
app.use(express.json());
const authRoutes = require('./routes/auth.routes');

app.use('/api/usuarios', require('./routes/usuario.routes'));
app.use('/api/marcas', require('./routes/marca.routes'));
app.use('/api/tipoproductos', require('./routes/tipoproducto.routes'));
app.use('/api/unidades', require('./routes/unidadmedida.routes'));
app.use('/api/productos', require('./routes/producto.routes'));
app.use('/api/ingresos', require('./routes/ingreso.routes'));
app.use('/api/salidas', require('./routes/salida.routes'));
app.use('/api/stock', require('./routes/stock.routes'));
app.use(express.json());
app.use('/api', authRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
