#!/usr/bin/env node
'use strict';
const AviGlitch = require('aviglitch');
const fs = require('fs');
const path = require('path');

const [ input, output ] = process.argv.slice(2);
const a = AviGlitch.open(path.resolve(process.cwd(), input));

let keys = [];
a.frames.each_with_index((f, i) => {
  if (f.is_keyframe) keys.push(i);
});

keys.forEach(i => {
  let fa = a.frames.at(i);
  let fb = a.frames.at(i+1);
  fb.data = fa.data;
  a.frames.insert(i, fb);
});

const dest = path.resolve(process.cwd(), output || 'out.avi');
a.output(dest, true, () => {
  process.exit();
});
