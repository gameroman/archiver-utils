import { inherits } from 'util';

import { Stream } from 'stream';
import { Writable } from 'readable-stream';

function DeadEndStream(options) {
  Writable.call(this, options);
}

inherits(DeadEndStream, Writable);

DeadEndStream.prototype._write = function(chuck, encoding, callback) {
  callback();
};

export { DeadEndStream };

function UnBufferedStream() {
  this.readable = true;
}

inherits(UnBufferedStream, Stream);

export { UnBufferedStream };
