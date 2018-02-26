'use strict';
const tempy = require('tempy');
const range = require('lodash/range');
const { promisify } = require('util');
const childProcess = require('child_process');
const execFile = promisify(childProcess.execFile);
const path = require('path');
const fs = require('fs');

// treats ffmpeg stderr as stdout
const runcmd = async (cmd, args, log = false) => {
  try {
    if (log) console.log([cmd, ...args].join(' '));
    const { stdout } = await execFile(cmd, args);
    return stdout;
  } catch({ stderr }) {
    return stderr;
  }
};

const mktmpdir = debug => {
  let dir;
  if (debug) {
    dir = path.resolve('./tmp');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  } else {
    dir = tempy.directory();
  }
  return dir;
};

const uid = () => range(4).map(() => Math.random().toString(16).slice(2)).join('');

const pp = x => {
  console.dir(x, {colors: true, depth: null});
  console.log('\n');
};

module.exports = {
  runcmd,
  mktmpdir,
  uid,
  pp
};
