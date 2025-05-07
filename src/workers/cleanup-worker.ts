import amqp from 'amqplib';
import { createSupabaseClient } from '../utils/supabase';
import { createRedisClient } from '../utils/redis';

async function startWorker() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL!);
  const channel = await conn.createChannel();
  const queue = 'file_cleanup';

  await channel.assertQueue(queue, { durable: true });

  console.log('Worker waiting for messages...');

  channel.consume(queue, async (msg) => {
    if (!msg) return;

    try {
      const { id, path } = JSON.parse(msg.content.toString());
      const supabase = createSupabaseClient();
      const redis = await createRedisClient();

      // Delete from storage
      const { error } = await supabase.storage
        .from('uploads')
        .remove([path]);

      if (error) throw error;

      // Cleanup Redis
      await redis.del(`file:${id}`);

      console.log(`Cleaned up file ${id}`);
      channel.ack(msg);
    } catch (err) {
      console.error('Cleanup failed:', err);
      channel.nack(msg);
    }
  });
}

startWorker().catch(console.error);
