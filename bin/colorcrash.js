#!/usr/bin/env node
// https://gist.github.com/ucnv/466869
'use strict';
const AviGlitch = require('aviglitch');
const random = require('lodash/random');
const times = require('lodash/times');
const fs = require('fs');
const path = require('path');

const [ input, output ] = process.argv.slice(2);
const a = AviGlitch.open(path.resolve(process.cwd(), input));

let deltas = [];
a.frames.each_with_index((f, i) => {
  if (f.is_deltaframe) deltas.push(i);
});

const q = a.frames.slice(0, 6);

times(100, () => {
  const i = deltas[random(deltas.length)];
  const x = a.frames.slice(i, i+1);
  q.concat(x.mul(random(50)));
});

const dest = path.resolve(process.cwd(), output || 'out.avi');
AviGlitch.open(q).output(dest, true, () => {
  process.exit(0);
});
