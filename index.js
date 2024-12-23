const net = require('net');
const carrier = require('carrier');

const gwId = process.argv[2];
console.log('---SIMPLE TAILER---');
if(!gwId){
    console.log('Please provide gwId as an argument');
    process.exit(1);
}
console.log('gwId: ' + gwId);

// Create persistent connection to TSDB
const tsdbClient = net.createConnection({ port: 5555, host: '127.0.0.1' }, () => {
    console.log('connected to tsdb');
    // test write
    //tsdbClient.write('{"operation":"write","Write":{"id":"test","Value":1}}\n');
});

tsdbClient.on('data', (data) => {
    console.log(data.toString());
})

function startTrailer() {
    const tailer = require('child_process').spawn('tail', ['-f', '/var/www/haserver_v2/log/'+gwId+'/*.log', '-n', '0'], { shell: true });
    
    carrier.carry(tailer.stdout, function(line) {
        let parts = line.split('|');
        if (parts[3] === 'FBdevice') {
            const p0 = parts[0];
            const p0parts = p0.split('(');
            const gwId = p0parts[1].replace(')', '');
            
            const did = parts[4];
            const gp = parts[5];
            const value = parts[7];

            let params = {
                "operation": "write",
                "Write": {
                    "id": `${gwId}_${did}_${gp}`,
                    "Value": value
                }
            };
            
            params = JSON.stringify(params);
            // Remove quotes from numbers
            const regex = /"(-|)([0-9]+(?:\.[0-9]+)?)"/g;
            params = params.replace(regex, '$1$2');
            
            tsdbClient.write(params + '\n');
        }
    });

    tailer.stderr.pipe(process.stderr);
}

startTrailer();
