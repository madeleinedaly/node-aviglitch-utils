#!/usr/bin/env node
'use strict';
const AviGlitch = require('aviglitch');
const parseInt = require('lodash/parseInt');
const meow = require('meow');
const path = require('path');
const fs = require('fs');
const { runcmd, mktmpdir } = require('./helper');

const options = {
  description: 'Crush the image tight into given video frame aspect. It gives the effects like bleeding.',
  help: `
Usage:
  __FILE__ <infile> [-r <ratio> -b <file> --raw] -o <outfile> [--debug]
  __FILE__ -h | --help
Options:
  -o <outfile>   Set output file name.
  -b <file>      Set a first frame image. JPEG or PNG.
  -r <ratio>     Set how small to crush (given number part of) [default: 5].
  --raw          Keep output as no-keyframe avi [default: false].
  --debug        Flag for debugging [default: false].
  -h --help      Show this screen.
`.replace(/__FILE__/g, path.basename(process.argv[1], '.js')),
  flags: {
    output: {type: 'string', alias: 'o'},
    bfile: {type: 'string', alias: 'b'},
    ratio: {type: 'string', alias: 'r', default: 5},
    raw: {type: 'boolean'},
    debug: {type: 'boolean'}
  }
};

(async cli => {
  if (cli.flags.h) cli.showHelp(0);
  const tmpdir = mktmpdir(cli.flags.debug);
  const infile = cli.input.shift();
  const info = await runcmd('ffmpeg', ['-i', infile]);
  const size = (m => m ? [parseInt(m[1]), parseInt(m[2])] : [1024, 768])(info.match(/(\d{3,})x(\d{3,})/));
  const fps = (m => m ? m[1] : 24)(info.match(/, ([\.\d]*) fp/));
  const basefile = path.join(tmpdir, 'base.avi');
  const bfile = cli.flags.b;
  await runcmd('ffmpeg', (
    bfile ? ['-loop', '1', '-f', 'image2', '-i', bfile] : ['-i', infile]
  ).concat(['-c:v', 'mpeg4', '-y', '-q:v', '0', '-t', '0.5', '-r', fps, '-an', basefile]));

  const avifile = path.join(tmpdir, 'mpeg4resized.avi');
  const ratio = parseFloat(cli.flags.r);
  const scale = size.map(n => n / ratio).join(':');
  await runcmd('ffmpeg', ['-i', infile, '-c:v', 'mpeg4', '-y', '-q:v', '0', '-vf', `scale=${scale}`, '-an', avifile]);

  const datamoshed = AviGlitch.open(avifile);
  datamoshed.remove_all_keyframes();

  const base = AviGlitch.open(basefile);
  base.mutate_keyframes_into_deltaframes();
  base.frames.concat(datamoshed.frames);
  datamoshed.close();

  const glitchfile = path.join(tmpdir, 'glitch.avi');
  base.output(glitchfile, true, async () => {
    const outfile = cli.flags.o;
    if (cli.flags.raw) {
      fs.copyFileSync(glitchfile, outfile);
    } else {
      await runcmd('ffmpeg', ['-i', infile, '-an', '-q:v', '0', '-y', outfile]);
    }
    process.exit();
  });
})(meow(options));
