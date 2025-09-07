// Simple test data seeder for development testing
// Run with: node scripts/seed-test-data.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedTestData() {
  try {
    console.log('🌱 Starting to seed test data...');

    // Find or create a test user (replace with actual user ID from your system)
    const testUser = await prisma.user.findFirst({
      where: {
        email: { contains: '@' } // Find any user with email
      }
    });

    if (!testUser) {
      console.log('❌ No user found. Please sign up first at http://localhost:3000/signup');
      return;
    }

    console.log(`👤 Using user: ${testUser.email}`);

    // Create or update wallet
    const wallet = await prisma.wallet.upsert({
      where: { userId: testUser.id },
      create: {
        userId: testUser.id,
        balance: 5000,
        monthlyBudget: 4000,
        currency: 'USD'
      },
      update: {
        balance: 5000,
        monthlyBudget: 4000,
        currency: 'USD'
      }
    });

    console.log('💰 Created/Updated wallet');

    // Add sample income entries
    const incomeData = [
      {
        source: 'Software Engineer Salary',
        amount: 6000,
        type: 'SALARY',
        description: 'Monthly salary from TechCorp Inc.',
        date: new Date('2024-01-01'),
        currency: 'USD',
        userId: testUser.id
      },
      {
        source: 'Freelance Web Development',
        amount: 1200,
        type: 'FREELANCE',
        description: 'Website project for local business',
        date: new Date('2024-01-15'),
        currency: 'USD',
        userId: testUser.id
      },
      {
        source: 'Performance Bonus',
        amount: 2000,
        type: 'BONUS',
        description: 'Q4 performance bonus',
        date: new Date('2024-01-31'),
        currency: 'USD',
        userId: testUser.id
      },
      {
        source: 'Stock Dividends',
        amount: 350,
        type: 'INVESTMENT',
        description: 'Quarterly dividend payout',
        date: new Date('2024-02-01'),
        currency: 'USD',
        userId: testUser.id
      },
      {
        source: 'Online Course Sales',
        amount: 800,
        type: 'SIDE_HUSTLE',
        description: 'Revenue from online programming course',
        date: new Date('2024-02-10'),
        currency: 'USD',
        userId: testUser.id
      }
    ];

    // Clear existing income entries for this user to avoid duplicates
    await prisma.income.deleteMany({
      where: { userId: testUser.id }
    });

    // Create new income entries
    for (const income of incomeData) {
      await prisma.income.create({ data: income });
    }

    console.log('💸 Created sample income entries');

    // Add sample expenses
    const expenseData = [
      {
        name: 'Groceries',
        amount: 150,
        category: 'food',
        date: new Date('2024-02-01'),
        userId: testUser.id
      },
      {
        name: 'Gas Station',
        amount: 80,
        category: 'transportation',
        date: new Date('2024-02-02'),
        userId: testUser.id
      },
      {
        name: 'Netflix Subscription',
        amount: 15.99,
        category: 'entertainment',
        date: new Date('2024-02-01'),
        userId: testUser.id
      },
      {
        name: 'Coffee Shop',
        amount: 25,
        category: 'food',
        date: new Date('2024-02-05'),
        userId: testUser.id
      },
      {
        name: 'Electric Bill',
        amount: 120,
        category: 'bills',
        date: new Date('2024-02-01'),
        userId: testUser.id
      }
    ];

    // Clear existing expenses for this user
    await prisma.expense.deleteMany({
      where: { userId: testUser.id }
    });

    // Create new expense entries
    for (const expense of expenseData) {
      await prisma.expense.create({ data: expense });
    }

    console.log('📊 Created sample expense entries');

    // Add sample savings goal
    await prisma.saving.deleteMany({
      where: { userId: testUser.id }
    });

    await prisma.saving.create({
      data: {
        name: 'Emergency Fund',
        targetAmount: 10000,
        currentAmount: 3500,
        targetDate: new Date('2024-12-31'),
        description: 'Building 6-month emergency fund',
        userId: testUser.id
      }
    });

    console.log('🎯 Created sample savings goal');

    console.log('\n✅ Test data seeded successfully!');
    console.log('🚀 You can now test the wallet page at: http://localhost:3000/wallet');
    console.log('\n📋 Test Data Summary:');
    console.log('   💰 Wallet Balance: $5,000');
    console.log('   📈 Monthly Budget: $4,000');
    console.log('   💸 Income Entries: 5 items');
    console.log('   📊 Expense Entries: 5 items');
    console.log('   🎯 Savings Goal: 1 item');

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedTestData();
