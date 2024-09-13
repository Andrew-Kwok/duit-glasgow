import type { NextApiRequest, NextApiResponse } from 'next';

const express = require('express');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();

    // Serve API routes from src/api
    server.use('/api', express.static(path.join(__dirname, 'src/api')));

    // Handle all other requests with Next.js
    server.all('*', (req: NextApiRequest, res: NextApiResponse) => {
        return handle(req, res);
    });

    server.listen(3000, (err: Error | null) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3000');
    });
});
