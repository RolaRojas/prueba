const http = require('http');
const url = require('url');
const fs = require('fs');
const rutas = require('./rutas/rutas'); // Importamos las rutas
const conexion = require('./db'); // Conexion a la base de datos
const querystring = require('querystring'); // Para procesar los datos del cuerpo de la solicitud
const jwt = require('jsonwebtoken'); // Importamos jsonwebtoken para verificar el token

const hostname = 'localhost';
const port = 3000;

// Función para obtener los datos del cuerpo de la solicitud
const getBodyData = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // Convertir los datos binarios a string
        });

        req.on('end', () => {
            resolve(body);
        });

        req.on('error', (err) => {
            reject(err);
        });
    });
};

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);

    // Si la ruta es la raíz, mostramos login.html
    if (parsedUrl.pathname === '/' && req.method === 'GET') {
        fs.readFile('public/login.html', 'utf8', (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end('Error al cargar la página de inicio');
                return;
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(data);
        });
    }
    // Si la ruta es /registro, mostramos registro.html
    else if (parsedUrl.pathname === '/registro' && req.method === 'GET') {
        fs.readFile('public/registro.html', 'utf8', (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end('Error al cargar la página de registro');
                return;
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(data);
        });
    }
    // Manejar rutas POST para registro y login
    else if (parsedUrl.pathname === '/registro' && req.method === 'POST') {
        rutas.handleRegister(req, res);
    }
    else if (parsedUrl.pathname === '/login' && req.method === 'POST') {
        rutas.handleLogin(req, res);
    }
    // Ruta para los dashboards
    else if (parsedUrl.pathname === '/dash_admin' && req.method === 'GET') {
        rutas.handleDashAdmin(req, res);
    }
    else if (parsedUrl.pathname === '/dash_soporte' && req.method === 'GET') {
        rutas.handleDashSoporte(req, res);
    }
    else if (parsedUrl.pathname === '/dash_usuario' && req.method === 'GET') {
        rutas.handleDashUsuario(req, res);
    }
    // Ruta para obtener los tickets desde el backend
    else if (parsedUrl.pathname === '/api/tickets' && req.method === 'GET') {
        const queryParams = parsedUrl.query;
        rutas.obtenerTickets(queryParams, res);
    }
    // Ruta para crear un nuevo ticket
    else if (parsedUrl.pathname === '/api/tickets' && req.method === 'POST') {
        try {
            // Leemos los datos del cuerpo de la solicitud usando la función getBodyData
            const body = await getBodyData(req);
            const formData = querystring.parse(body); // Usamos querystring para parsear los datos
            const descripcion = formData.descripcion;

            // Obtener el token de la cabecera Authorization
            const token = req.headers['authorization']?.split(' ')[1]; // El token debe estar en el formato "Bearer <token>"

            if (!token) {
                res.statusCode = 400; // Bad Request
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, message: 'Token no proporcionado' }));
                return;
            }

            // Intentamos verificar el token
            jwt.verify(token, 'tu_clave_secreta', (err, decoded) => {
                if (err) {
                    res.statusCode = 401; // Unauthorized
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: false, message: 'Token inválido' }));
                    return;
                }

                // El token es válido, obtenemos el ID del usuario desde el payload
                const id_usuario = decoded.id;

                // Llamamos al controlador para crear el ticket
                rutas.crearTicket({ descripcion, id_usuario }, res);
            });

        } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, message: 'Error al procesar los datos del formulario' }));
        }
    }
    // Ruta de login GET
    else if (parsedUrl.pathname === '/login' && req.method === 'GET') {
        fs.readFile('public/login.html', 'utf8', (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end('Error al cargar la página de login');
                return;
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(data);
        });
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, message: 'Página no encontrada' }));
    }
});

server.listen(port, hostname, () => {
    console.log(`Servidor corriendo en http://${hostname}:${port}/`);
});
