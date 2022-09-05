# Logman the mission

We want to create a state logger which logs messages in a queue. We would like to use a binary format
for that task. 

This should be our binary format:  

```
Bytes > |         4         |       1       |     8     |        1       |    n    |
Key   > | UNIX Timestamp(s) | State Bitmask | Signature | Message length | Message |
```

The [UNIX Timestamp](https://en.wikipedia.org/wiki/Unix_time) represents the time of the in seconds.
The signature are the first 8 bytes of of `md5(state + (normalized(message)))` and is stored with the message.
A message can have a max length of 255 Byte (utf-8 encoded).
The state is a represented as a bit mask of the 8 states:
Message is a UTF-8 string. Before hashing the message with the state to create a signature, the message
must be normalized as following: Lowercase the String and strip out all characters not in the range of `a-z` and `0-9`.

```
1      : Machine running
1 << 1 : Pipe A open
1 << 2 : Pipe B open
1 << 3 : Pipe C open
1 << 4 : Valve X open
1 << 5 : Valve Y open
1 << 6 : Power saving mode
1 << 7 : Alarm mode
```

On start we read the log from start to end and determine the current state.
When a new message arrives we only create a new entry if we don't find the 
signature already contained in the logs.

### Function tasks

- Create a function `bool log()`
- Accept a `String mode = 'ON' | 'OFF'`, `int state` and a `String message` as functions paramters
- Create or load a file `log.ltm`
- Reevaluate the state from the log file
- Create the signature of the new message
- If that signature is not contained in the file, create a new entry
- Return true if the file is updated, false if the signature was already included
- Create a seperate function `int state()` which only returns the state of the machine.
- The log must save the new full machine state

#### Hints

- Set a bit in bitmask: `bitmask = bitmask | bit`
- Unset a bit in a bitmask: `bitmaks = bitmask & ~bit`
- You will need: `readFile`, `writeFile`, `DataView`, `ArrayBuffer`, `Uint8Array`, `crypto.createHash('md5')` and `(new Date()).valueOf()`
- Google for: `node js working with bytes`, `node js buffer`