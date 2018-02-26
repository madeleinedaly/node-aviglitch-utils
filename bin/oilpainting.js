#!/usr/bin/env node
'use strict';
const AviGlitch = require('aviglitch');
const times = require('lodash/times');
const meow = require('meow');
const path = require('path');
const fs = require('fs');
const { runcmd, uid } = require('./helper');

const options = {
  description: false,
  help: `
Usage:
  __FILE__ <infile> [-o <outfile> -u <unit> -s <step>]
Options:
  -o --output <outfile>  Set output file name [default: out.avi].
  -u --unit <unit>       Set unit size [default: 3].
  -s --step <step>       Set step size [default: 1].
  -h --help              Show this screen.
`.replace(/__FILE__/g, path.basename(process.argv[1], '.js')),
  flags: {
    output: {type: 'string', alias: 'o', default: 'out.avi'},
    unit: {type: 'string', alias: 'u', default: '3'},
    step: {type: 'string', alias: 's', default: '1'}
  }
};

(async cli => {
  if (cli.flags.h) cli.showHelp(0);
  const [ unit, step ] = ['u', 's'].map(flag => parseInt(cli.flags[flag], 10));
  const tmp = `${uid()}.avi`;
  await runcmd('ffmpeg', ['-i', cli.input.shift(), '-an', '-vcodec', 'copy', '-r', '30', tmp]);
  const g = AviGlitch.open(tmp);
  g.glitch('keyframe', x => null);

  let q = null;
  const size = g.frames.size();
  times(Math.ceil(size / step), i => {
    const pos = i * step;
    const f = g.frames.slice(pos, pos + unit);
    if (q === null) {
      q = f;
    } else {
      q.concat(f);
    }
    console.log(`>> ${String(pos).padStart(String(size).length, '0')}/${size}`);
  });

  AviGlitch.open(q).output(cli.flags.o, true, () => process.exit());
  fs.unlink(tmp);
})(meow(options));
