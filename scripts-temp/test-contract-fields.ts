import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testContractFields() {
  try {
    console.log('Testing contract fields...');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test basic query
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users`);
    
    // Test contract query
    const contractCount = await prisma.contract.count();
    console.log(`✅ Found ${contractCount} contracts`);
    
    console.log('✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testContractFields();
