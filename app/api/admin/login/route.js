// Simple password-based authentication
// In production, use proper authentication with hashed passwords

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function POST(request) {
    try {
        const body = await request.json();
        const { password } = body;

        if (password === ADMIN_PASSWORD) {
            // Generate a simple token (in production, use JWT or sessions)
            const token = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
            
            return Response.json({
                success: true,
                token
            });
        } else {
            return Response.json(
                { success: false, error: 'Invalid password' },
                { status: 401 }
            );
        }
    } catch (error) {
        return Response.json(
            { success: false, error: 'Invalid request' },
            { status: 400 }
        );
    }
}

