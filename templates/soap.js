header('SOAPAction', '""');
contentType('text/xml');

var cols = JSON.parse(JSON.stringify(result.cols));

var tableName = req.tableAs || req.table;
var S = (tableName) + 'Response';
escHtml = unsafe => typeof unsafe === 'string' ? unsafe.replace(/&/g, '&amp;').replace(/[<>'"]/g, c => escHtml.chars[c]) : unsafe;
escHtml.chars = {
    '<': '&lt'
  , '>': '&gt'
  , "'": '&apos;'
  , '"': '&quot;'}
escXml = escHtml;
xmlType = (t,r) => t
formatCell = (type, rawType, val) => escXml(val);

var O = '<?xml version="1.0" encoding="UTF-8"?>' +
'\n<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://producer.x-road.eu" xmlns:iden="http://x-road.eu/xsd/identifiers" xmlns:xrd="http://x-road.eu/xsd/xroad.xsd" xmlns:px="http://xsd.planetcross.net/planetcross.xsd">' +
'\n    <SOAP-ENV:Header>' +
vars.soapHeader + 
'\n    </SOAP-ENV:Header>' +
'\n    <SOAP-ENV:Body>' +
'\n        <ns1:' + S + '>' +
'\n';

if (! ['insert','update','delete'].includes(vars.servtype)) {
  let xsType = result.types.map(t => xmlType(t));

  // put intervals to ISO format
  result.rawTypes.forEach((rawType, colId) => {
    if (rawType.substr(0, 'interval'.length) === 'interval') {
      for (let r = 0; r < result.data.length; r++) {
        let intv = result.data[r][colId];
        if (intv && intv.toISO) {
          result.data[r][colId] = intv.toISO();
          xsType[colId] = 'duration';
        }
      }
    }
  });

  O += result.data.map(r => (
    '<row>\n' +
      cols.map((c,ci) => `<${c} type="${xsType[ci]}"` + (r[c] === null ? '/>' : ('>' + formatCell(xsType[ci], result.rawTypes[ci], r[c]) + '</' + c + '>'))).join('\n') +
    '\n</row>'
  )).join("\n")
} else {
    let P = await post(req.table, vars, [vars]);
    //O += '<!-- ' + JSON.stringify(P) + ' -->\n'
    O += '<result>' + (P.affected.length ? P.affected[0] : '0') + '</result>';
}

O+= '\n        </ns1:' + S + '>' +
    '\n    </SOAP-ENV:Body>' +
    '\n</SOAP-ENV:Envelope>';

print(O);

