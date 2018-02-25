#!/usr/bin/env node
'use strict';
const AviGlitch = require('aviglitch');
const meow = require('meow');
const path = require('path');
const { mktmpdir, runcmd } = require('./helper');

const options = {
  description: 'Glitch with Huffyuv codec.',
  help: `
Usage:
  __FILE__ <infile> [-s <n> -d <n> -h <n> -r <n-m>] -o <outfile> [--debug]
  __FILE__ -h | --help
Options:
  -o <outfile>  Set output file name.
  -d <n>        Set video duration by seconds. It is preferred to be less than 60s. [default: 30].
  -r <n-m>      Set range in height of the glitch effect. It should be between 0 and 1. Or you can set increase-decrease value like "0.1-0.9" [default: 0.99].
  -s <n>        Set start position of the video by seconds.
  --debug       Flag for debugging [default: false].
  -h --help     Show this screen.
`.replace(/__FILE__/g, path.basename(process.argv[1], '.js')),
  flags: {
    output: {type: 'string', alias: 'o'},
    duration: {type: 'number', alias: 'd', default: 30},
    range: {type: 'string', alias: 'r', default: '0.99'},
    start: {type: 'number', alias: 's'},
    debug: {type: 'boolean', default: false}
  }
};

(async cli => {
  if (cli.flags.h) cli.showHelp(0);
  const tmpdir = mktmpdir(cli.flags.debug);
  const other_options = ['-t', cli.flags.d];
  if (cli.flags.s) other_options.push('-ss', cli.flags.s);
  const huffyuvfile = path.join(tmpdir, 'huffyuv.avi');
  await runcmd('ffmpeg', ['-i', cli.input.shift(), ...other_options, '-c:v', 'huffyuv', '-pix_fmt', 'yuv422p', '-y', '-q:v', '0', '-an', huffyuvfile]);
  const a = AviGlitch.open(huffyuvfile);
  const l = a.frames.size();
  const pos = cli.flags.r.split('-');
  pos[1] = pos[1] || pos[0];
  const [ sp, ep ] = pos.map(parseFloat);
  a.glitch_with_index((f, i) => {
    const p = i / l;
    const ratio = (ep - sp) * p + sp;
    return f.slice(0, (1 - ratio) * f.length);
  });
  const glitchfile = path.join(tmpdir, 'glitch.avi');
  a.output(glitchfile, true, async () => {
    await runcmd('avconv', ['-i', glitchfile, '-an', '-q:v', '0', '-c:v', 'mpeg4', cli.flags.o]);
    process.exit();
  });
})(meow(options));
