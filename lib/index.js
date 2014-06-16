var fs = require('fs')
  , path = require('path')
  , spawn = require('child_process').spawn
  , chalk = require('chalk')
  , util = require('util')
  , format = util.format
  , EE = require('events').EventEmitter
  , argsplit = require('argsplit')

function walk(dir, cwd) {
  var results = []

  fs.readdirSync(dir).forEach(function(file) {
    filePath = path.join(dir, file)
    var stats = fs.statSync(filePath)
    if (stats && stats.isDirectory()) {
      results = results.concat(walk(filePath, cwd))
    } else {
      var subDir = dir.substr(cwd.length)
      results.push(path.join(subDir, file))
    }
  })

  return results
}

module.exports = verde

function verde(opts) {
  if (!(this instanceof verde))
    return new verde(opts)

  EE.call(this)
  this.reporter = opts.reporter || 'list'
  this.messages = {}
  this.results = {}
  this.color = opts.hasOwnProperty('color') ? opts.color : true
  this.require = opts.require || []
  this.recursive = opts.recursive || false
  if (!Array.isArray(this.require)) this.require = [this.require]
  this.dir = opts.dir || process.cwd()
  this.files = opts.files || []
  this.addons = opts.options || []
  if (!this.files.length) {
    this.files = this.recursive ? walk(this.dir, this.dir) : fs.readdirSync(this.dir)
    this.files = this.files.filter(function(file) {
      return path.extname(file) === '.js'
    }).map(function(file) {
      return path.join(this.dir, file)
    }.bind(this))
  }
  this.suites = this.files.length
}

util.inherits(verde, EE)

verde.prototype.runTest = function(filename, cb) {
  var cmd = '/usr/bin/env'
  var color = this.color ? '--colors' : '--no-colors'
  var args = [
    'mocha'
  , '-R'
  , this.reporter
  , color
  ].join(' ')
  if (this.require.length) {
    this.require.forEach(function(r) {
      args += ' -r '+r
    })
  }
  if (this.addons.length) {
    args += ' '+this.addons.join(' ')
  }
  args = argsplit(args)
  args.push(filename)
  this.emit('test:start', filename)
  var child = spawn(cmd, args, {
    env: process.env
  , cwd: process.cwd()
  })

  child.stdout.on('data', function(d) {
    process.stdout.write(d)
    d = d.toString()
    this.messages[filename] += d
  }.bind(this))

  child.stderr.on('data', function(d) {
    process.stderr.write(d)
    d = d.toString()
    this.messages[filename] += d
  }.bind(this))

  child.on('exit', function(code) {
    if (code !== 0) {
      var err = new Error('Test exited with non-zero code')
      err.code = code
      err.test = path.basename(filename)
      this.emit('test:error', err, filename, this.messages[filename])
      return cb && cb(err)
    }
    this.emit('test:finish', filename, this.messages[filename])
    cb && cb()
  }.bind(this))
}

verde.prototype.run = function() {
  var filename
  if (filename = this.files.shift()) {
    this.messages[filename] = ''
    this.runTest(filename, function(err) {
      this.results[filename] = err ? false : true
      this.run()
    }.bind(this))
  } else {
    this.emit('done')
  }
}
