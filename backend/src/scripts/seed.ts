import 'dotenv/config';
import { sequelize } from '../db';
import { KnowledgeBase } from '../db/models/KnowledgeBase';

const seedKnowledgeBase = async () => {
  try {
    // Ensure DB is connected
    await sequelize.authenticate();
    console.log('📦 Connected to database.');

    // Sync models
    await sequelize.sync();

    // Clear existing data
    await KnowledgeBase.destroy({ where: {} });
    console.log('🧹 Cleared existing knowledge base entries.');

    const entries = [
      {
        title: 'Shipping Policy',
        category: 'Shipping',
        content: 'We offer free standard shipping on all orders over $50. Standard shipping takes 3-5 business days. Expedited 2-day shipping is available for $15. We currently only ship within the United States.',
      },
      {
        title: 'Return and Refund Policy',
        category: 'Returns',
        content: 'We have a 30-day hassle-free return policy. Items must be unworn, unwashed, and in their original packaging. Once we receive the returned item, refunds are processed to the original payment method within 5-7 business days.',
      },
      {
        title: 'Customer Support Hours',
        category: 'Support',
        content: 'Our customer support team is available Monday through Friday, from 9:00 AM to 6:00 PM EST. We are closed on weekends and major holidays. You can reach us at support@example.com.',
      }
    ];

    await KnowledgeBase.bulkCreate(entries);
    console.log('✅ Successfully seeded the Knowledge Base with fictional store policies!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedKnowledgeBase();
