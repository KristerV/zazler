/* SQL

CREATE TABLE classes (
    id serial primary key NOT NULL,
    code text not null unique,
    name text
);

*/

let express = require('express')();
const formParser = require('express-form-data');
const cookieParser = require('cookie-parser');
const dbConn = "psql://postgres@127.0.0.1/alfa";
const zConf = {
  read: "*",
  write: "*",
  "write-rules":
    [ { "table": "classes", "action": "update", "on": "notnull(new.id)", "where": "id=new.id", "returning": "id=new.id" },
      { "table": "classes", "action": "insert", "on": "isnull(new.id)", "returning": "seq id classes_id_seq" } ]
}

express.use(formParser.parse({ autoFiles: true }));
express.use(formParser.format());
express.use(formParser.stream());
express.use(formParser.union());
express.use(cookieParser());

require('./app.js')(dbConn, zConf)
.then(sqlApi => {
  sqlApi.on('sql', console.log);
  express.use('/db/', sqlApi.expressRequest);
  express.listen(8001);
  console.log('Listening port', 8001)
  console.log(sqlApi.sqlType);
});

// curl 'http://localhost:3003/db/classes.json' -H 'Content-Type: text/plain;charset=UTF-8' -X POST -d '[{"code":"TEST","ekn":null}]' --compressed

