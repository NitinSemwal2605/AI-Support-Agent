import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const knowledgeBaseEntries = [
  {
    title: 'Shipping Policy',
    category: 'shipping',
    content: `Our shipping policy:
- Orders are processed within 24 hours of placement.
- Domestic shipping takes 3-5 business days.
- International shipping takes 7-14 business days.
- Free domestic shipping on orders over $50.
- Express shipping (1-2 business days) is available for an additional fee.
- You will receive a tracking number via email once your order ships.`,
  },
  {
    title: 'Returns Policy',
    category: 'returns',
    content: `Our returns policy:
- Products may be returned within 30 days of purchase.
- Items must be unused, unwashed, and in their original packaging with all tags attached.
- To initiate a return, contact our support team with your order number.
- Return shipping costs are the responsibility of the customer unless the item is defective.
- Damaged or defective items will be replaced at no charge.
- Digital products and personalized items are non-returnable.`,
  },
  {
    title: 'Refund Policy',
    category: 'refunds',
    content: `Our refund policy:
- Refunds are processed within 5-7 business days after we receive and inspect the returned item.
- Refunds are issued to the original payment method.
- You will receive an email confirmation once your refund has been processed.
- Partial refunds may be issued for items that are returned in a condition different from how they were sold.
- Original shipping costs are non-refundable unless the return is due to our error.`,
  },
  {
    title: 'Support Hours',
    category: 'support',
    content: `Our customer support hours:
- Monday to Friday: 9:00 AM – 6:00 PM IST
- Saturday: 10:00 AM – 2:00 PM IST
- Sunday: Closed
- You can reach us via live chat, email at support@example.com, or phone at +91-XXXXXXXXXX.
- Response time for email inquiries is within 24 business hours.
- For urgent issues outside of support hours, please email us and we'll respond first thing next business day.`,
  },
  {
    title: 'International Shipping',
    category: 'shipping',
    content: `International shipping details:
- We ship to over 50 countries worldwide.
- International orders may be subject to import duties, taxes, and customs fees, which are the buyer's responsibility.
- Delivery times for international orders are 7-14 business days, depending on destination and customs.
- We use trusted couriers like DHL, FedEx, and local postal services for international delivery.
- International orders over $150 qualify for free shipping.`,
  },
  {
    title: 'Order Tracking',
    category: 'orders',
    content: `How to track your order:
- Once your order ships, you will receive a shipping confirmation email with a tracking number.
- You can track your order directly on our website under "My Orders" or via the courier's website.
- Tracking information may take up to 24 hours to update after your order ships.
- If you haven't received your order within the expected timeframe, contact our support team.`,
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing knowledge base entries
  await prisma.knowledgeBase.deleteMany();
  console.log('🗑️  Cleared existing knowledge base entries');

  // Seed knowledge base
  for (const entry of knowledgeBaseEntries) {
    await prisma.knowledgeBase.create({ data: entry });
  }

  console.log(`✅ Seeded ${knowledgeBaseEntries.length} knowledge base entries`);
  console.log('🎉 Database seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
