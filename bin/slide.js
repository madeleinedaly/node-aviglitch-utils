#!/usr/bin/env node
'use strict';
const AviGlitch = require('aviglitch');
const path = require('path');

const [ input, output ] = process.argv.slice(2);
const avi = AviGlitch.open(path.resolve(process.cwd(), input));

let prev = null;
avi.glitch('keyframe', frame => {
  const x = prev || frame;
  prev = frame;
  return x;
});

const dst = path.resolve(process.cwd(), output || 'out.avi');
avi.output(dst, true, () => process.exit());
