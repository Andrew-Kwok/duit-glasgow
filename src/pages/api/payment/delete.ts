import type {NextApiRequest, NextApiResponse} from 'next';
import PaymentService from '@component/pages/api/payment/service/service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { id } = req.query;
    const { code } = req.body;
    if (code !== process.env.UPDATE_DATABASE_CODE) {
        return res.status(403).json({ error: 'Invalid or missing code' });
    }

    if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing payment ID' });
    }

    try {
        await PaymentService.deletePaymentById(id);
        res.status(200).json({ message: 'Payment deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting payment:', error);
        res.status(500).json({ error: error.message });
    }
}
