const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    let server;

    if (process.env.NODE_ENV === 'production') {
        // Production HTTPS server
        const httpsOptions = {
            key: fs.readFileSync(path.join(__dirname, 'certificates', 'localhost-key.pem')),
            cert: fs.readFileSync(path.join(__dirname, 'certificates', 'localhost.pem'))
        };

        server = createServer(httpsOptions, async (req, res) => {
            try {
                const parsedUrl = parse(req.url, true);
                await handle(req, res, parsedUrl);
            } catch (err) {
                console.error('Error occurred handling', req.url, err);
                res.statusCode = 500;
                res.end('internal server error');
            }
        });
    } else {
        // Development server (Next.js handles HTTPS with --experimental-https)
        const { createServer: createHttpServer } = require('http');
        server = createHttpServer(async (req, res) => {
            try {
                const parsedUrl = parse(req.url, true);
                await handle(req, res, parsedUrl);
            } catch (err) {
                console.error('Error occurred handling', req.url, err);
                res.statusCode = 500;
                res.end('internal server error');
            }
        });
    }

    server.listen(port, (err) => {
        if (err) throw err;
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        console.log(`> Ready on ${protocol}://${hostname}:${port}`);
    });
});
