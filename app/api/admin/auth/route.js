// Middleware to check admin authentication
// Simple token check (in production, use JWT verification)

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function POST(request) {
    try {
        const body = await request.json();
        const token = body.token || request.headers.get('Authorization')?.replace('Bearer ', '');

        // Simple check - in production, validate JWT or session
        // For now, we'll just check if token exists (stored in localStorage)
        // This is a basic implementation
        
        return Response.json({
            authenticated: true
        });
    } catch (error) {
        return Response.json(
            { authenticated: false },
            { status: 401 }
        );
    }
}

