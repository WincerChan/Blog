#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const util = require('util');

const readdirAsync = util.promisify(fs.readdir);

async function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(data);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function fetchFilesInDirectory(directoryPath, urlPrefix) {
    try {
        const files = await readdirAsync(directoryPath);
        const fileUrls = files.map((file) => path.join(urlPrefix, file));
        const fetchPromises = fileUrls.map((url) => fetchUrl(url));
        const responses = await Promise.all(fetchPromises);
        fileUrls.forEach(url => console.log(`Hit ${url}`))
    } catch (error) {
        console.error('Error:', error);
    }
}

const directoryPath = './dist/public/assets/';
const siteConf = JSON.parse(fs.readFileSync("./hugo.json"))
const urlPrefix = `${siteConf.assetsPrefix}assets/`;

fetchFilesInDirectory(directoryPath, urlPrefix);
