//Hon/Bun
import express from 'express'
const router = express.Router();

import db_connection from './core/db_connection.js'

import { nanoid } from "nanoid";

async function getShortURL(connection){
    let shortURL;
    let checkQuery;
    let ret;

    do{
        shortURL = nanoid(16);

        checkQuery = `
            SELECT USERID, VIDEOID
            FROM URLS
            WHERE SHORTURL='${shortURL}'
        `

        ret = await connection.execute(checkQuery);
    }while( ret.rows.length != 0);

    console.log(shortURL);

    return shortURL;
}

async function getUserId(connection) {
    let userId;
    let checkQuery;
    let ret;

    do{
        userId = nanoid(16);

        checkQuery = `
            SELECT SHORTURL
            FROM URLS
            WHERE USERID='${userId}'
        `;

        ret = await connection.execute(checkQuery);
    } while( ret.rows.length != 0);

    return userId;
}

async function getChunk(string){
    let _len = string.length;
    let _chunk = [];
    let _index = 0;
    let _chunk_size = 4000;
    while( _index < _len ){
        _chunk.push( `TO_CLOB('${string.slice(_index, _index+_chunk_size)}')` );
        _index += _chunk_size; 
    }

    return _chunk;
}

async function getTest(req, res){
    await db_connection( req, res, async (connection) => {
        let { src } = req.query;

        res.send({
            data : {},
            message : `test is working ${src}`
        });
    })
}

async function getLongURL(req, res){
    await db_connection( req, res, async (connection) => {
        let { shortURL } = req.query;

        console.log('getLongURL...', shortURL);

        if( shortURL == undefined ){ return }

        let offset = 1;

        let longUrl = '';
        let getQuery;
        let ret;

        do{
            getQuery = `
                SELECT DBMS_LOB.GETLENGTH(LONGURL) AS LEN, DBMS_LOB.SUBSTR(LONGURL, 4000, ${offset}) AS STR
                FROM URLS
                WHERE SHORTURL='${shortURL}'
            `

            ret = await connection.execute(getQuery);

            console.log(ret.rows);

            longUrl.concat(ret.rows[0]['STR']);
            offset += 4000;
        }while( ret.rows.length > 0 && offset < ret.rows[0]['LEN'] );

        res.send({
            data : longUrl,
            message : 'success'
        });
    })
}

async function insertLongURL(req, res){
    await db_connection( req, res, async (connection) => {

        let { userId, videoId, string } = req.body;

        console.log(string.length);

        let _userId = userId;
        if( userId == undefined ){
            _userId = await getUserId(connection);
        }

        console.log(_userId);

        if( videoId == undefined || string == undefined ) return;
        
        let existQuery = `
            SELECT SHORTURL
            FROM URLS
            WHERE USERID='${_userId}' AND VIDEOID='${videoId}'
        `

        let retExist = await connection.execute(existQuery);

        console.log(retExist);

        let shortURL;
        if(retExist.rows.length == 0){

            shortURL = await getShortURL(connection);

            let _chunk = await getChunk(string);

            let query = `
                INSERT INTO URLS(USERID, VIDEOID, LONGURL, SHORTURL)
                VALUES ('${_userId}', '${videoId}', ${_chunk.join('||')}, '${shortURL}')
            `
            
            let _ret = await connection.execute(query);
        }
        else{
            //update
            let _chunk = await getChunk(string);
            
            let query = `
                UPDATE URLS
                SET LONGURL=${_chunk.join('||')}
                WHERE USERID='${_userId}' AND VIDEOID='${videoId}'
            `

            await connection.execute(query);

            let getShortQuery = `
                SELECT SHORTURL
                FROM URLS
                WHERE USERID='${_userId}' AND VIDEOID='${videoId}'
            `;

            let ret = await connection.execute(getShortQuery);

            console.log(ret);

            shortURL = ret.rows[0]['SHORTURL'];
        }

        await connection.execute('commit');

        res.send({
            data : { userId : _userId, shortURL : shortURL },
            message : 'success'
        });
    })
}

router.get('/test', getTest);

router.get('/longUrl', getLongURL);
router.post('/longUrl', insertLongURL);

export default router;