import express from 'express';
const app = express();

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import cors from 'cors';
import bodyParser from 'body-parser';

import api from './Router/db_api.js';

app.use(cors({ origin : 'http://localhost:3000' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false }));

app.use("/api", api);

const port = 5000;

app.listen(port, () => {
    console.log(`${port}`)
});
