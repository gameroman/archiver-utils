import { assert } from 'chai';

import { Stream } from 'stream';
import { Readable } from 'readable-stream';
import { Writable } from 'readable-stream';
import { PassThrough } from 'readable-stream';

import { DeadEndStream, UnBufferedStream } from './helpers';

import { dateify, defaults, isStream, normalizeInputSource, sanitizePath, trailingSlashIt, unixifyPath, walkdir } from '../index.js';

const testDateString = 'Jan 03 2013 14:26:38 GMT';
const testDate = new Date(testDateString);

describe('utils', function() {

  describe('index', function() {

    describe('dateify(dateish)', function() {
      it('should return an instance of Date', function() {
        assert.instanceOf(dateify(testDate), Date);
        assert.instanceOf(dateify(testDateString), Date);
        assert.instanceOf(dateify(null), Date);
      });

      it('should passthrough an instance of Date', function() {
        assert.deepEqual(dateify(testDate), testDate);
      });

      it('should convert dateish string to an instance of Date', function() {
        assert.deepEqual(dateify(testDateString), testDate);
      });
    });

    describe('defaults(object, source, guard)', function() {
      it('should default when object key is missing', function() {
        var actual = defaults({ value1: true }, {
          value2: true
        });

        assert.deepEqual(actual, {
          value1: true,
          value2: true
        });
      });
    });

    describe('isStream(source)', function() {
      it('should return false if source is not a stream', function() {
        assert.notOk(isStream('string'));
        assert.notOk(isStream(new Buffer(2)));
      });

      it('should return true if source is a stream', function() {
        assert.ok(isStream(new Stream()));

        assert.ok(isStream(new Readable()));
        assert.ok(isStream(new Writable()));
        assert.ok(isStream(new PassThrough()));

        assert.ok(isStream(new UnBufferedStream()));
        assert.ok(isStream(new DeadEndStream()));
      });
    });

    describe('normalizeInputSource(source)', function() {
      it('should normalize strings to an instanceOf Buffer', function() {
        var normalized = normalizeInputSource('some string');

        assert.instanceOf(normalized, Buffer);
      });

      it('should normalize older unbuffered streams', function() {
        var noBufferStream = new UnBufferedStream();
        var normalized = normalizeInputSource(noBufferStream);

        assert.instanceOf(normalized, PassThrough);
      });
    });

    describe('sanitizePath(filepath)', function() {
      it('should sanitize filepath', function() {
        assert.equal(sanitizePath('\\this/path//file.txt'), 'this/path/file.txt');
        assert.equal(sanitizePath('/this/path/file.txt'), 'this/path/file.txt');
        assert.equal(sanitizePath('./this\\path\\file.txt'), './this/path/file.txt');
        assert.equal(sanitizePath('../this\\path\\file.txt'), 'this/path/file.txt');

        assert.equal(sanitizePath('c:\\this\\path\\file.txt'), 'this/path/file.txt');
        assert.equal(sanitizePath('\\\\server\\share\\'), 'server/share/');
      });
    });

    describe('trailingSlashIt(str)', function() {
      it('should add trailing slash when missing', function() {
        assert.equal(trailingSlashIt('this/path'), 'this/path/');
        assert.equal(trailingSlashIt('this/path/'), 'this/path/');
      });
    });

    describe('unixifyPath(filepath)', function() {
      it('should unixify filepath', function() {
        assert.equal(unixifyPath('this\\path\\file.txt'), 'this/path/file.txt');
        assert.equal(unixifyPath('c:\\this\\path\\file.txt'), '/this/path/file.txt');
      });
    });

    describe('walkdir(dirpath, base, callback)', function() {
      it('should walk a directory', function(done) {
        walkdir('test/fixtures/directory', function(err, results) {
          if (err) {
            return done(err);
          }

          assert.isArray(results);

          done();
        });
      });
    });

  });

});
