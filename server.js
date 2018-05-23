var http = require('http');

const express = require('express')
const app = express()

//app.get('/', (req, res) => res.send('Hello World!'))

app.listen(80, () => console.log('App listening on port 80!'))


//app.use('/static', express.static('files'));

app.use('/files', express.static(__dirname + '/files'))
//app.use('/files',express.static());

//app.use(express.static(path.join('F:\WebDev\gitKraken\DDash_advanced\dashBase', 'files')));
/*
// create a server
http.createServer(function (req, res) {
    // code to feed or request and prepare response
}).listen(9100); //the server object listens on port 9000


http.createServer(function (req, res) {
    // http header
    // 200 - is the OK message
    // to respond with html content, 'Content-Type' should be 'text/html'
    res.writeHead(200, {'Content-Type': 'text/html'}); 
    res.write('Node.js says hello!'); //write a response to the client
    res.end(); //end the response
}).listen(9400); //the server object listens on port 9000

*/

/*var request = require('request')

var url = 'http://127.0.0.1:5984/'
var db = 'mydatabase/'
var id = 'document_id'*/

// Create a database/collection inside CouchDB
/*request.put(url + db, function(err, resp, body) {
  // Add a document with an ID
  request.put({
    url: url + db + id,
    body: {message:'New Shiny Document', user: 'stefan'},
    json: true,
  }, function(err, resp, body) {
    // Read the document
    request(url + db + id, function(err, res, body) {
      console.log(body.user + ' : ' + body.message)
    })
  })
})*/