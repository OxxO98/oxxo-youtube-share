import express from 'express';
const app = express();

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import cors from 'cors';
import bodyParser from 'body-parser';

import api_test from './Router/db_test.js';

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false }));

app.use("/test", api_test);

const port = 5000;

app.listen(port, () => {
    console.log(`${port}`)
});
