const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Use Google DNS

const host = 'nataliahernandez.lzmvwzv.mongodb.net';

console.log('Resolving SRV for', `_mongodb._tcp.${host}`);
dns.resolveSrv(`_mongodb._tcp.${host}`, (err, addresses) => {
  if (err) {
    console.error('SRV Error:', err.message);
  } else {
    console.log('SRV Resolved:', addresses);
    // Print connection string piece
    const hosts = addresses.map(a => `${a.name}:${a.port}`).join(',');
    
    dns.resolveTxt(host, (errTxt, txtRecords) => {
        let authSource = 'admin';
        let replicaSet = '';
        if (!errTxt && txtRecords.length > 0) {
            console.log('TXT Resolved:', txtRecords);
            const txt = txtRecords[0].join('');
            if (txt.includes('authSource=')) {
                const match = txt.match(/authSource=([^&]+)/);
                if (match) authSource = match[1];
            }
            if (txt.includes('replicaSet=')) {
                const match = txt.match(/replicaSet=([^&]+)/);
                if (match) replicaSet = match[1];
            }
        }
        
        let connStr = `mongodb://nataliahernandez3112_db_user:5mDm1LW6PZN7kuor@${hosts}/natalia?ssl=true&authSource=${authSource}`;
        if (replicaSet) connStr += `&replicaSet=${replicaSet}`;
        console.log('\n--- CONNECTION STRING ---');
        console.log(connStr);
    });
  }
});
