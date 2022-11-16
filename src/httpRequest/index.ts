const https = require('https');

export const get = async url => {
  return new Promise((resolve, reject) => {
    var req = https.get(url, function(res) {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`error with status code ${res.statusCode}`));
        }
        let body = [];
        res.on('data', function(chunk) {
          body.push(chunk);
        });
        res.on('end', function() {
          try {
            body = JSON.parse(Buffer.concat(body).toString());
          } catch(e) {
            reject(e);
          }
          resolve(body);
        });
    });
    req.on('error', function(err) {
        reject(err);
    });
    req.end();
  });
}