const amqp = require('amqp-connection-manager');

const QUEUE_NAME = '<queue>';
const RABBITMQ_HOST = 'amqp://localhost'

// Handle an incomming message.
const onMessage = function (data) {
  const message = JSON.parse(data.content.toString());
  console.log("receiver: got message", message);
  channelWrapper.ack(data);
}

// Create a connetion manager
const connection = amqp.connect([RABBITMQ_HOST]);
connection.on('connect', function () {
  console.log('Connected!');
});
connection.on('disconnect', function (err) {
  console.log('Disconnected.', err.stack);
});
connection.on('connectFailed', (err, url) => {
  console.log('connectFailed', err, url);
})

// Set up a channel listening for messages in the queue.
const channelWrapper = connection.createChannel({
  setup: function (channel) {
    // `channel` here is a regular amqplib `ConfirmChannel`.
    return Promise.all([
      channel.assertQueue(QUEUE_NAME, { durable: false }),
      channel.prefetch(1),
      channel.consume(QUEUE_NAME, onMessage)
    ]);
  }
});

setTimeout(() => {
  connection.close();
  process.exit();
}, 5000);
