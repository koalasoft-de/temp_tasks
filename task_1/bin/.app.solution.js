import { open, stat, writeFile, appendFile, readFile } from 'node:fs/promises';
import crypto   from 'crypto';

const state = {
  machineRunning  : 1,
  pipeAOpen       : 2,
  pipeBOpen       : 4,
  pipeCOpen       : 8,
  valveXOpen      : 16,         
  valveYOpen      : 32,
  powerSavingMode : 64,
  alarmMode       : 128
}

const _log        = [],
      _fileExists = async path => !!(await stat(path).catch(e => false)),
      _normalize  = (msg) => msg.toLowerCase().replace(/[^a-z0-9]+/g, ''),
      _decoder    = new TextDecoder('utf-8');


async function _getLog() {
  while (_log.length > 0) _log.pop();

  if (!await _fileExists('log.ltm')) {
    await writeFile('log.ltm', []);
  }

  let file   = await readFile('log.ltm'),
      view   = new DataView(file.buffer),
      index  = 0,
      log    = new LogEntry();

  while (index < view.byteLength) {
    log.time      = new Date(view.getUint32(index)); index += 4;
    log.state     = view.getUint8(index);            index ++;
    log.signature = Buffer.from(view.buffer.slice(index, index + 8)).toString('hex'); index += 8;
    log.message   = _decoder.decode(view.buffer.slice(index + 1, index + 1 + view.getUint8(index)));

    index += 1 + view.getUint8(index);

    _log.push(log); 
    
    log = new LogEntry();
  }

  return _log;
}

async function _state() {
  await  _getLog();

  return _log.length ? _log[_log.length - 1].state : 0;
}

export default async function log(mode, state, message) {
  let cstate     = mode == 'ON' ? await _state() | state : await _state() & ~state,
      signature  = crypto.createHash('md5').update(cstate + _normalize(message)).digest('hex').substring(0, 16),
      time       = (new Date()).valueOf(),
      bufferView = new DataView(new ArrayBuffer(14 + message.length)),
      index      = 0;

  for (let log of _log) {
    if (log.signature == signature) {
      console.log('Ignore existing signature');

      return false;
    }
  }

  signature = Buffer.from(signature, 'hex');

  /*
    Bytes > |         4         |       1       |     8     |        1       |    n    |
    Key   > | UNIX Timestamp(s) | State Bitmask | Signature | Message length | Message |
  */

  bufferView.setUint32(index, time);  index += 4;
  bufferView.setUint8(index, cstate); index++;

  while (index < 5 + signature.length) {
    bufferView.setUint8(index, signature[index - 5]);  index ++;
  }

  bufferView.setUint8(index, message.length); index++;

  while (index < 14 + message.length) {
    bufferView.setUint8(index, message.charCodeAt(index - 14));  index ++;
  }

  await appendFile('log.ltm', new Uint8Array(bufferView.buffer));

  console.log('New state: ' + cstate);

  return true;
}

class LogEntry {
  time;
  state;
  signature;
  message;
}