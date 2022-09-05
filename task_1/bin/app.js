import { open, stat, writeFile, appendFile, readFile } from 'node:fs/promises';
import crypto from 'crypto';

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

class LogEntry {
  time;
  state;
  signature;
  message;
}

export default async function log(mode, state, message) {
 

  return true;
}

