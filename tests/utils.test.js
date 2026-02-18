import { describe, expect, it } from "bun:test";

import { Stream } from 'stream';
import { Readable } from 'readable-stream';
import { Writable } from 'readable-stream';
import { PassThrough } from 'readable-stream';

import { DeadEndStream, UnBufferedStream } from './helpers';

import { dateify, defaults, isStream, normalizeInputSource, sanitizePath, trailingSlashIt, unixifyPath, walkdir } from '../src/index.js';

const testDateString = 'Jan 03 2013 14:26:38 GMT';
const testDate = new Date(testDateString);

describe("utils", () => {
  describe("index", () => {
    describe("dateify(dateish)", () => {
      it("should return an instance of Date", () => {
        expect(dateify(testDate)).toBeInstanceOf(Date);
        expect(dateify(testDateString)).toBeInstanceOf(Date);
        expect(dateify(null)).toBeInstanceOf(Date);
      });

      it("should passthrough an instance of Date", () => {
        expect(dateify(testDate)).toEqual(testDate);
      });

      it("should convert dateish string to an instance of Date", () => {
        expect(dateify(testDateString)).toEqual(testDate);
      });
    });

    describe("defaults(object, source, guard)", () => {
      it("should default when object key is missing", () => {
        const actual = defaults({ value1: true }, { value2: true });

        expect(actual).toEqual({
          value1: true,
          value2: true,
        });
      });
    });

    describe("isStream(source)", () => {
      it("should return false if source is not a stream", () => {
        expect(isStream("string")).toBe(false);
        expect(isStream(new Uint8Array(2))).toBe(false); // Buffer → Uint8Array in modern contexts, but works either way
      });

      it("should return true if source is a stream", () => {
        expect(isStream(new Stream())).toBe(true);

        expect(isStream(new Readable())).toBe(true);
        expect(isStream(new Writable())).toBe(true);
        expect(isStream(new PassThrough())).toBe(true);

        expect(isStream(new UnBufferedStream())).toBe(true);
        expect(isStream(new DeadEndStream())).toBe(true);
      });
    });

    describe("normalizeInputSource(source)", () => {
      it("should normalize strings to an instanceOf Buffer", () => {
        const normalized = normalizeInputSource("some string");

        expect(normalized).toBeInstanceOf(Buffer);
      });

      it("should normalize older unbuffered streams", () => {
        const noBufferStream = new UnBufferedStream();
        const normalized = normalizeInputSource(noBufferStream);

        expect(normalized).toBeInstanceOf(PassThrough);
      });
    });

    describe("sanitizePath(filepath)", () => {
      it("should sanitize filepath", () => {
        expect(sanitizePath("\\this/path//file.txt")).toBe("this/path/file.txt");
        expect(sanitizePath("/this/path/file.txt")).toBe("this/path/file.txt");
        expect(sanitizePath("./this\\path\\file.txt")).toBe("./this/path/file.txt");
        expect(sanitizePath("../this\\path\\file.txt")).toBe("this/path/file.txt");

        expect(sanitizePath("c:\\this\\path\\file.txt")).toBe("this/path/file.txt");
        expect(sanitizePath("\\\\server\\share\\")).toBe("server/share/");
      });
    });

    describe("trailingSlashIt(str)", () => {
      it("should add trailing slash when missing", () => {
        expect(trailingSlashIt("this/path")).toBe("this/path/");
        expect(trailingSlashIt("this/path/")).toBe("this/path/");
      });
    });

    describe("unixifyPath(filepath)", () => {
      it("should unixify filepath", () => {
        expect(unixifyPath("this\\path\\file.txt")).toBe("this/path/file.txt");
        expect(unixifyPath("c:\\this\\path\\file.txt")).toBe("/this/path/file.txt");
      });
    });

    describe("walkdir(dirpath, base, callback)", () => {
      it("should walk a directory", (done) => {
        walkdir("tests/fixtures/directory", (err, results) => {
          if (err) {
            done(err);
            return;
          }

          expect(Array.isArray(results)).toBe(true);

          done();
        });
      });
    });
  });
});
