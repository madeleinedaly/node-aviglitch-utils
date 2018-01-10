'use strict';
const tempy = require('tempy');
const { promisify } = require('util');
const childProcess = require('child_process');
const execFile = promisify(childProcess.execFile);
const execSync = childProcess.execSync;
const path = require('path');
const fs = require('fs');

const ffmpeg = async args => {
  console.log(`ffmpeg ${args}`);
  try {
    const { stdout } = await execFile('ffmpeg', args.split(' '));
    return stdout;
  } catch({ stderr }) {
    return stderr;
  }
};

const mktmpdir = debug => {
  let dir;
  if (debug) {
    dir = path.resolve(process.cwd(), '../tmp');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  } else {
    dir = tempy.directory();
  }
  return dir;
};

module.exports = {
  ffmpeg,
  mktmpdir
};
