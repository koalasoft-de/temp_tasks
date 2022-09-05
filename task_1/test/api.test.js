import { rm } from 'node:fs/promises';
import log from '../bin/app';

beforeAll(() => rm('log.ltm'));


test('The app should work', async () => {
  expect(await log('ON', 1,   'Turning the machine on!')).toBe(true);
  expect(await log('ON', 1,   'Turning the machine on!')).toBe(false);
  expect(await log('ON', 2,   'Turning on!')).toBe(true);
  expect(await log('ON', 4,   'Turning on!')).toBe(true);
  expect(await log('ON', 8,   'What did I do?')).toBe(true);
  expect(await log('ON', 64,  'Today it will happen!')).toBe(true);
  expect(await log('OFF', 64, 'Today it will happen!')).toBe(true);
  expect(await log('OFF', 64, 'Today it will happen!')).toBe(false);
  expect(await log('ON', 32,  'Good day!')).toBe(true);
  expect(await log('ON', 128, 'Good day!')).toBe(true);
  expect(await log('ON', 128, 'Good day!')).toBe(false);

  for (let i = 0; i < 512; i++) {
    expect(await log(Math.random() < 0.5 ? 'OFF' : 'ON', Math.floor(Math.random() * 128), 'Test: ' + Math.round(Math.random() * 1000000))).toBe(true);
  }

  expect(await log('OFF', 1,  'Finished for today :)')).toBe(true);
});