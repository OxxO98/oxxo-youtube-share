//Hon/Bun
const express = require("express");
const router = express.Router();

const db_conn = require('./core/db_connection.js');

async function getTest(req, res){
    await db_conn.db_connection( req, res, async (connection) => {
        let { src } = req.query;

        res.send(`test is working ${src}`)
    })
}

router.get('/test', getTest);

module.exports = router;