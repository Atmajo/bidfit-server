import { Consumer, Kafka, Partitioners } from "kafkajs";
import { redisClient } from "../lib/redis";
import { sendEmail, userRegistration } from "../actions";

const kafka = new Kafka({
  clientId: "bidfit-kafka",
  brokers: ["localhost:9092"],
});

export const producer = kafka.producer({
  allowAutoTopicCreation: true,
  createPartitioner: Partitioners.LegacyPartitioner,
});

const registrationConsumer = kafka.consumer({
  groupId: "bidfit-kafka-group-1",
});
const notificationConsumer = kafka.consumer({
  groupId: "bidfit-kafka-group-2",
});

export const initializeServices = async () => {
  try {
    await producer.connect();
    console.log("Producer connected");

    await registrationConsumer.connect();
    console.log("User Registration Consumer connected");

    await notificationConsumer.connect();
    console.log("Notification Consumer connected");

    await redisClient.connect();
    console.log("Redis client connected");

    subscribeToQueue(
      registrationConsumer,
      "user-registration",
      async (message) => {
        console.log("User Registration message received:", message);

        await userRegistration(message);
      }
    );

    subscribeToQueue(
      notificationConsumer,
      "notification",
      async (message: { name: string; email: string; body: string }) => {
        console.log("Notification received:", message);

        await sendEmail(message);
      }
    );
  } catch (error) {
    console.error("Error initializing services:", error);
  }
};

// Subscribe to queues
const subscribeToQueue = async (
  consumer: Consumer,
  topic: string,
  onMessage: (message: any) => Promise<void>
) => {
  try {
    // Subscribe the consumer to the topic
    await consumer.subscribe({ topic: topic });
    console.log(`Subscribed to topic: ${topic}`);

    // Start consuming messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const messageContent = message.value?.toString() || "{}";
        const parsedMessage = sanitizeAndParseMessage(messageContent);
        console.log(`Received message from ${topic}:`, parsedMessage);

        // Call the provided onMessage function with the parsed message
        await onMessage(parsedMessage);
      },
    });
  } catch (error) {
    console.error("Error subscribing to queue:", error);
  }
};

// Sanitize and parse the message content
const sanitizeAndParseMessage = (messageContent: string) => {
  // Replace "None" with "null" to handle non-standard JSON
  const sanitizedContent = messageContent.replace(/\bNone\b/g, "null");

  // Parse and return the sanitized JSON
  return JSON.parse(sanitizedContent);
};
