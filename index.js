const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { createWriteStream } = require('fs');
const config = require('./config.json');

app.use(bodyParser.json());

app.all('/', (req, res) => {
    return res.status(404).send('<h1>404 Page Not Found</h1>');
});

app.post('/api/upload', (req, res, next) => {
    if (!req.body.auth || req.body.auth != config.token) return res.status(403).send('<h1>403 Unauthorized</h1>');
    if (!req.body.auth || !req.body.url) return res.status(400).send('<h1>Insufficient Data!</h1>');
    if (!/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(req.body.url)) return res.status(400).send('<h1>Invalid URL!</h1>');

    const http = req.body.url.startsWith('https://') ? require('https') : require('http');

    const file = createWriteStream((config.directory.endsWith('/') ? config.directory : config.directory + '/') + /(?<=\/)[^\/\?#]+(?=[^\/]*$)/.exec(req.body.url)[0]);

    try {
        http.get(req.body.url, (response) => {
            return response.pipe(file);
        });
        return res.status(201).send('<h1>Uploaded file!</h1>');
    } catch (err) {
        return next(err);
    }
});

app.listen(config.port, () => console.log(`Server running at https://localhost:${config.port}/`));