#!/usr/bin/env node

var fs = require('fs')
  , verde = require('../')
  , chalk = require('chalk')
  , nopt = require('nopt')
  , path = require('path')
  , knownOpts = { dir: path
                , file: [path]
                , help: Boolean
                , version: Boolean
                , reporter: String
                , color: Boolean
                , require: Array
                }
  , shortHand = { d: ['--dir']
                , f: ['--file']
                , h: ['--help']
                , v: ['--version']
                , R: ['--reporter']
                , r: ['--require']
                , c: ['--color']
                , colors: ['--color']
                }
  , parsed = nopt(knownOpts, shortHand)
  , util = require('util')
  , format = util.format

if (parsed.help) {
  usage(0)
  return
}

if (parsed.version) {
  console.log('verde', 'v'+require('../package').version)
  return
}

parsed.dir = parsed.dir || process.cwd()
parsed.color = parsed.hasOwnProperty('color') ? parsed.color : true
if (parsed.argv.remain.length) {
  parsed.options = parsed.argv.remain
}
verde = new verde(parsed)

verde.on('test:start', function(filename) {
  console.log('running suite %d of %d [%s]'
            , verde.suites - verde.files.length
            , verde.suites
            , path.basename(filename))
})

verde.on('done', function() {
  var suites = Object.keys(verde.results)
    , total = suites.length
    , passed = suites.filter(function(suite) {
      return verde.results[suite] === true
    })

  if (parsed.color) {
    var color = passed.length === total
      ? chalk.green
      : chalk.red

    var out = [ color(format('%d', passed.length))
              , 'of'
              , color(format('%d', total))
              , 'suites passed'
              ].join(' ')

    console.log(out)
    var line = ''
    for (var i=0; i<chalk.stripColor(out).length; i++) {
      line += '-'
    }
    console.log(line)

    suites.forEach(function(result) {
      var res = path.basename(result)
      if (verde.results[result]) {
        console.log(chalk.green('passed'), res)
      } else {
        console.log(chalk.red('failed'), res)
      }
    })
  } else {
    var out = format('%d of %d suites passed', passed.length, total)
    console.log(out)
    var line = ''
    for (var i=0; i<out.length; i++) {
      line += '-'
    }
    console.log(line)
    suites.forEach(function(result) {
      if (verde.results[result]) {
        console.log('passed', path.basename(result))
      } else {
        console.log('failed', path.basename(result))
      }
    })
  }
  if (passed.length === total) process.exit()
  else process.exit(1)
})

verde.run()

function usage(code) {
  var rs = fs.createReadStream(__dirname + '/usage.txt')
  rs.pipe(process.stdout)
  rs.on('close', function() {
    if (code) process.exit(code)
  })
}
