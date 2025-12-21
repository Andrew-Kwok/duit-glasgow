import {ADD_BALANCES_BY_DELTA, TABLE_NAMES} from "@component/app/api/constants";
import {Balance, Person} from "@component/models/person";
import {createSupabaseClient} from "@component/app/api/lib/supabase";

export default {
    getPersons,
    getPersonById,
    addBalancesByDelta
}

async function getPersons(): Promise<Person[]> {
    const { data, error } = await createSupabaseClient()
        .from(TABLE_NAMES.PERSON)
        .select(`
        id,
        name,
        balance,
        created_at,
        updated_at,
        balances:id_balance_map (
          currency,
          balance
        )
        `)
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

async function addBalancesByDelta(balanceDelta: Balance[]): Promise<void> {
    const deltas = balanceDelta.filter(b => Math.abs(b.balance) > 1e-12);
    if (deltas.length === 0) return;

    const {error} = await createSupabaseClient().rpc(ADD_BALANCES_BY_DELTA, {
        deltas,
    });

    if (error) {
        throw new Error(`addBalancesByDelta failed: ${error.message}`);
    }
}
