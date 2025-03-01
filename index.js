import express from 'express';
import fetch from 'node-fetch';
import { createClient } from 'redis';
import log from 'node-file-logger';
import os from 'os';

const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_SERVER = process.env.REDIS_SERVER || '127.0.0.1';
const ADD_HOSTNAME= process.env.ADD_HOSTNAME || false;

const client = createClient({
  url: `redis://${REDIS_SERVER}:${REDIS_PORT}`
});

client.on('error', (err) => {
  console.error('Redis Client Error', err);
  log.Error(err, 'RedisClient', 'RedisClient');
});

await client.connect();

const app = express();
const options = {
  folderPath: './logs/',
  dateBasedFileNaming: true,
  fileNamePrefix: 'DailyLogs_',
  fileNameExtension: '.log',
  dateFormat: 'YYYY_MM_D',
  timeFormat: 'h:mm:ss A',
};

log.SetUserOptions(options);

// Set response
function setResponse(username, repos) {
  log.Info(`${username} has ${repos} Github repos`);
  let responseHtml = `<h2>${username} has ${repos} Github repos</h2>`;
  console.log(`Served from: ${ADD_HOSTNAME}`);
  if (ADD_HOSTNAME) {
    const hostname = os.hostname();
    responseHtml += `<p>Served from: ${hostname}</p>`;
    
  }
  return responseHtml;
}

// Make request to Github for data
async function getRepos(req, res, next) {
  try {
    const { username } = req.params;
    log.Info(`Fetching Data...https://api.github.com/users/${username}`);
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (response.status === 404) {
      res.status(404).send('User not found');
      return;
    }
    const data = await response.json();
    const repos = data.public_repos;
    // Set data to Redis
    await client.set(username, repos);
    const responseHtml = setResponse(username, repos);
    res.send(responseHtml);
  } catch (err) {
    console.error(err);
    log.Error(err, 'getRepos', 'getRepos');
    res.status(500).send('Server Error');
  }
}

// Cache middleware
async function cache(req, res, next) {
  const { username } = req.params;

  try {
    const data = await client.get(username);

    if (data !== null) {
      res.send(setResponse(username, data+" (cached)"));
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    log.Error(err, 'cache', 'cache');
    res.status(500).send('Server Error');
  }
}

app.get('/repos/:username', cache, getRepos);

app.listen(PORT, () => {
  log.Info(`App listening on port ${PORT}`);
  console.log(`App listening on port ${PORT}`);
});