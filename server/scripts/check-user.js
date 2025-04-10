import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function checkUser() {
    try {
        // Check if user with ID 1 exists
        const user1 = await prisma.user.findUnique({
            where: { id: 1 }
        });
        console.log('User with ID 1:', user1);
        // Check if user with ID 15 exists
        const user15 = await prisma.user.findUnique({
            where: { id: 15 }
        });
        console.log('User with ID 15:', user15);
        // List all users
        const allUsers = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                uid: true,
                role: true
            }
        });
        console.log('All users:', allUsers);
    }
    catch (error) {
        console.error('Error checking users:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
// Execute the function
checkUser()
    .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
})
    .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
});
