const http = require('http');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');
const path = require('path');

const contentTypes = {
    '.css': 'text/css',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.srt': 'text/plain'
};

const server = http.createServer((req, res) => {
    if(req.method === 'GET'){
        var q = url.parse(req.url, true);
        var pathname = q.pathname === "/" ? "/index.html" : q.pathname;
        var filename = "." + pathname;
        fs.readFile(filename, function(err, data) {
          if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            return res.end("404 Not Found");
          } 
          var contentType = contentTypes[path.extname(filename)] || 'application/octet-stream';
          res.writeHead(200, {'Content-Type': contentType});
          res.write(data);
          return res.end();
        });
    }
    else if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
            //const reqsub = querystring.parse(body);
           // console.log(`Received data from client: ${JSON.stringify(reqsub)}`);
            const reqsub = JSON.parse(body);
            const filename = reqsub.fileName;
            console.log(filename);
            const replacedSub = reqsub.replacedSub;
            console.log(replacedSub);
            // process the parameters as needed
            saveFile(filename,replacedSub);
            //end
            res.end('Data received and processed successfully!');
        });
      } else {
        
        res.end('Invalid request method.');
      }
       
  });
  const PORT = 3000;
  server.listen(PORT, () => {
    console.log(` my Server listening on port ${PORT}...`);
  });  



function saveFile(fileName1,text){
// Define the data to be saved to the file
//const data = text;

// Define the file path and file name
const filePath = './data/';
const fileName = fileName1;

// Create the file path if it doesn't exist
if (!fs.existsSync(filePath)) {
  fs.mkdirSync(filePath);
}

// Write the data to the file
fs.writeFile(`${filePath}/${fileName}`, text, (err) => {
  if (err) throw err;
  console.log('Data has been saved to the file!');
});
}
