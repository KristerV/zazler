
let srv = require('express')();

async function main() {
  let a = await require('./app.js')("file:///home/docker/zazler/alfa.sqlite", { read: '*'} );
  let b = await require('./app.js')("file:///home/docker/zazler/bravo.sqlite",
    { read: '*',
      write: "*",
      // protect: "*",
      varsWithout$: true,
      // auth: { realm: "heh", table: "u", where: "req.user=u.usr", select: "id,usr" },
      "write-rules": [ { table: "x", on: "true", action: "insert", returning: "i=new.id" }],
      // alias: [ { table: "x", name: "y", vars: { select: "i" } } ]
    } );
  a.export.b = b;
  b.export.log = console.log;
  b.on('sql', console.log);
  srv.use('/a/', a.expressRequest);
  srv.use('/b/', b.expressRequest);
  srv.listen(8001, '0.0.0.0');
  console.log('listening 8001');
}

main();
