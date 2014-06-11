# verde

Run multiple files through mocha.

But mocha already runs multiple files? Yes, this runs the files one by one.

Sometimes it just is easier to do it this way

## Install

```bash
$ npm install --save-dev verde
```

## Usage (CLI)

```bash
$ verde [options]
```

## API

### verde(opts:Object)

_opts_ can have the following keys:

- `reporter` {String} the mocha reporter (defaults to `list`)
- `color` {Boolean} whether to use colors (defaults to `true`)
- `require` {Array} require additional modules (defaults to `[]`)
- `dir` {String} the directory to read (defaults to `process.cwd()`)
- `files` {Array} the files to run (defaults to all `.js` files in `opts.dir`)
- `addons` {Array} additional options to pass to mocha

### verde.run()

Begins running the files through mocha

## Events

### `test:start`

Emitted when the file is passed to mocha

- `filename` the file being run

### `test:error`

Emitted on test failure

- `err`
- `filename`
- `stdout/stderr`

### `test:finish`

Emitted when the test succeeds

- `filename`
- `stdout/stderr`

### `done`

Emitted when all files have been run through mocha

## License

MIT

## Author

Evan Lucas
