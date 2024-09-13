import {TABLE_NAMES} from "@component/pages/api/constants";
import {Person} from "@component/models/person";
import {createSupabaseClient} from "@component/pages/api/lib/supabase";

export default {
    getPersons,
    getPersonById,
    updateBalances
}

async function getPersons(): Promise<Person[]> {
    const { data, error } = await createSupabaseClient()
        .from(TABLE_NAMES.PERSON)
        .select('id, name, balance, created_at, updated_at')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching persons:', error);
        throw new Error(`Failed to fetch persons: ${error.message}`);
    }

    return data || [];
}

async function getPersonById(id: string): Promise<Person> {
    const { data, error } = await createSupabaseClient()
        .from(TABLE_NAMES.PERSON)
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching person by ID:', error);
        throw new Error(`Failed to fetch person by ID: ${error.message}`);
    }

    if (!data) {
        throw new Error(`Person with ID ${id} not found`);
    }

    return data;
}
async function updateBalances(updatedBalances: Person[]): Promise<void> {
    const { error } = await createSupabaseClient()
        .from(TABLE_NAMES.PERSON)
        .upsert(updatedBalances, { onConflict: 'id' });


    if (error) {
        console.error('Error updating balances:', error);
        throw new Error(`Failed to update balances: ${error.message}`);
    }
}