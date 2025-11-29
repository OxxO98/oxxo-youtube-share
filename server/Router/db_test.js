//Hon/Bun
const express = require("express");
const router = express.Router();

const db_conn = require('./core/db_connection.js');

async function getTest(req, res){
    await db_conn.db_connection( req, res, async (connection) => {
        console.log('api test is working');
        console.log(`connectString : ${connection.connectString}`)
    })
}

router.get('/test', getTest);

module.exports = router;