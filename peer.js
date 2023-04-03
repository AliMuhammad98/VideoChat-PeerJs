const { PeerServer } = require('peer');

const peerServer = PeerServer({ port: 9000, path: '/peerjs' });

peerServer.on('connection', (client) => {
    console.log('Client connected:', client.id);
  });
console.log('PeerJS server running on port 9000');