const fs = require('fs');

let data = 'email\n'; // CSV হেডার

for (let i = 1; i <= 50000; i++) {
  data += `testuser${i}@example.com\n`;
}

fs.writeFile('emails.csv', data, (err) => {
  if (err) throw err;
});
