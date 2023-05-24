const path = require('path');
const { createWriteStream } = require('fs');

let i = 0;
var stream = createWriteStream(path.join(__dirname, 'fakeWriting.txt'), {
  flags: 'a',
});

for (i = 0; i <= 1000000; i++) {
  // console.log(i);
  stream.write(i + '\n');
}

console.log('EXITING');
// process.exit();
