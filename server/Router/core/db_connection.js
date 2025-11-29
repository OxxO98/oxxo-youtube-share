const oracledb = require('oracledb');
const dbConfig = require('./react-youtube-translate-share-config/config.js');

async function db_connection(req, res, func){

  return await (async (req, res) => {
    let connection;
    try{
      console.log(dbConfig);

      connection = await oracledb.getConnection({
        user : dbConfig.user,
        password : dbConfig.password,
        connectString : dbConfig.connectString
      })
      oracledb.outFormat = oracledb.OBJECT;

      await func(connection);

    } catch(err) {
      if(connection){
        await connection.execute('rollback');
      }
      res.end();
      console.error(err);
    } finally {
      if(connection){
        await connection.execute('commit');
        try{
          await connection.close();
          res.end();
        } catch(err){
          console.error(err);
          res.end();
        }
      }
    }
  })(req, res);
}

module.exports = {
  db_connection
}