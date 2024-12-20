import {createClient} from "@supabase/supabase-js";

export function createSupabaseClient() {
    const supabaseUrl = process.env.SUPABASE_URL as string;
    const supabaseKey = process.env.SUPABASE_ANON_KEY as string;
    return createClient(supabaseUrl, supabaseKey);
}
