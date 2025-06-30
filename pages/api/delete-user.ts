// pages/api/delete-user.ts
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    try {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (error) {
            throw error;
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}