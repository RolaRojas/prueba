const mysql = require('mysql');

const conexion = mysql.createConnection({
    host: '127.0.0.1',
    user: 'isac',
    password: 'spike123',
    database: 'SistemaSoporte'
});

conexion.connect((error) => {
    if (error) {
        console.error('Error conectando a la base de datos:', error);
        return;
    }
    console.log('Conexión exitosa a la base de datos.');
});

module.exports = conexion;
