import {HARD_REFRESH_BALANCES} from "@component/pages/api/constants";
import {createSupabaseClient} from "@component/pages/api/lib/supabase";
import {NextApiRequest, NextApiResponse} from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { code } = req.body;
    if (code !== process.env.UPDATE_DATABASE_CODE) {
        return res.status(403).json({ error: 'Invalid or missing code' });
    }

    try {
        await createSupabaseClient().rpc(HARD_REFRESH_BALANCES);
        res.status(200).json({ message: 'Balances refreshed successfully.' });
    } catch (error: any) {
        console.error('Error calling hard refresh balances:', error);
        res.status(500).json({ error: error.message });
    }
}