import type {NextApiRequest, NextApiResponse} from 'next';
import PersonService from "@component/pages/api/person/service/service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'GET') {
            res.setHeader('Allow', ['GET']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }

        const persons = await PersonService.getPersons();
        return res.status(200).json(persons);
    } catch (error: any) {
        console.error('Error fetching persons:', error);
        return res.status(500).json({ error: error.message });
    }
}
