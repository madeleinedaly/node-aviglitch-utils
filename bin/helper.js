'use strict';
const tempy = require('tempy');
const { promisify } = require('util');
const childProcess = require('child_process');
const execFile = promisify(childProcess.execFile);
const path = require('path');
const fs = require('fs');

// treats ffmpeg stderr as stdout
const runcmd = async (cmd, args) => {
  try {
    const { stdout } = await execFile(cmd, args);
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

const id = () => Math.random().toString(36).slice(2);

module.exports = {
  runcmd,
  mktmpdir,
  id
};
