#!/usr/bin/env node
'use strict';
const AviGlitch = require('aviglitch');
const replace = require('buffer-replace');
const random = require('lodash/random');
const meow = require('meow');
const path = require('path');
const { mktmpdir, runcmd } = require('./helper');

const options = {
  description: 'Glitch with SNOW codec.',
  help: `
Usage:
  __FILE__ <infile> [-s <n> -d <n> --debug] -o <outfile>
  __FILE__ -h | --help
Options:
  -o <outfile>  Set output file name.
  -s <n>        Set start position of the video by seconds.
  -d <n>        Set duration of the result video by seconds.
  --debug       Flag for debugging [default: false].
  -h --help     Show this screen.
`.replace(/__FILE__/g, path.basename(process.argv[1], '.js')),
  flags: {
    output: {type: 'string', alias: 'o'},
    start: {type: 'number', alias: 's'},
    duration: {type: 'number', alias: 'd'},
    debug: {type: 'boolean', default: false}
  }
};

(async cli => {
  if (cli.flags.h) cli.showHelp(0);
  const tmpdir = mktmpdir(cli.flags.debug);
  const other_options = [];
  if (cli.flags.s) other_options.push('-ss', cli.flags.s);
  if (cli.flags.d) other_options.push('-t', cli.flags.d);
  const snowfile = path.join(tmpdir, 'snow.avi');
  await runcmd('ffmpeg', ['-i', cli.input.shift(), ...other_options, '-strict', '-2', '-c:v', 'snow', '-pix_fmt', 'yuv420p', '-y', '-q:v', '1', '-an', snowfile]);
  const a = AviGlitch.open(snowfile);
  a.glitch('keyframe', f => replace(f, String(random(10)), 'a'));
  const glitchfile = path.join(tmpdir, 'glitch.avi');
  a.output(glitchfile, true, async () => {
    await runcmd('ffmpeg', ['-i', glitchfile, '-an', '-q:v', '0', cli.flags.o]);
    process.exit();
  });
})(meow(options));
