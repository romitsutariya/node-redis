const express = require('express');
const fetch = require('node-fetch');
const redis = require('redis');
const log = require('node-file-logger');

const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_SERVER = process.env.REDIS_SERVER || '127.0.0.1';

const client = redis.createClient(REDIS_PORT,REDIS_SERVER);

const app = express();
const options = {
  folderPath: './logs/',
  dateBasedFileNaming: true,
  fileNamePrefix: 'DailyLogs_',
  fileNameExtension: '.log',    
  dateFormat: 'YYYY_MM_D',
  timeFormat: 'h:mm:ss A',
}

log.SetUserOptions(options);
// Set response
function setResponse(username, repos) {
  log.Info(`${username} has ${repos} Github repos`);
  return `<h2>${username} has ${repos} Github repos</h2>`;
}

// Make request to Github for data
async function getRepos(req, res, next) {
  try {
    log.Info(`Fetching Data...https://api.github.com/users/${username}`);
    const { username } = req.params;

    const response = await fetch(`https://api.github.com/users/${username}`);

    const data = await response.json();

    const repos = data.public_repos;

    // Set data to Redis
    client.setex(username, 3600, repos);
    var reponse=setResponse(username, repos)
   // log.Info(reponse);
    res.send(reponse);
  } catch (err) {
    console.error(err);
    log.Error(err, 'getRepos', 'getRepos');
    res.status(500);
  }
}

// Cache middleware
function cache(req, res, next) {
  const { username } = req.params;

  client.get(username, (err, data) => {
    if (err) throw err;

    if (data !== null) {
      res.send(setResponse(username, data));
    } else {
      next();
    }
  });
}

app.get('/repos/:username', cache, getRepos);

app.listen(PORT, () => {
  log.Info(`App listening on port ${PORT}`);
});
