// Declaración de liberías
const express = require('express');
const cors = require('cors');

const db = require('mongoose');

// Inicializar variables
const app = express();

const port = process.env.PORT || 3000;

// Importar rutas
var appRoutes = require('./routes/app');
var usuariosRoutes = require('./routes/usuario');
var hospitalesRoutes = require('./routes/hospital');
var medicosRoutes = require('./routes/medico');
var busquedasRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');
var loginRoutes = require('./routes/login');

var myfoxRoutes = require('./routes/myfox');

// Conexión con la DB
db.connect('mongodb://localhost:27017/hospitalDB', {useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false});

db.connection.on('error', err => {
    console.error('Error conectando con la DB', err);
    throw err;  // detenemos toda la ejecución
});


// Middlewares

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
//     res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
//     next();
// });

app.use(cors());

// Formato del body
app.use(express.urlencoded({extended: false}));  // parse application/x-www-form-urlencoded 
app.use(express.json());                         // parse application/json

// Server index config
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'));
// app.use('/uploads', serveIndex(__dirname + '/uploads'));

// Rutas como middlewares
app.use('/', appRoutes);  
app.use('/usuario', usuariosRoutes);  
app.use('/hospital', hospitalesRoutes);  
app.use('/medico', medicosRoutes);  
app.use('/busqueda', busquedasRoutes);  
app.use('/upload', uploadRoutes);  
app.use('/img', imagenesRoutes);  
app.use('/login', loginRoutes);  

app.use('/myfox', myfoxRoutes);

// Escuchar peticiones
app.listen(port, () => console.log(`listening on http://localhost:${port}`));
