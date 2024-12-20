import { NextResponse } from "next/server";
import PersonService from "@component/app/api/person/service";
import {checkAuth} from "@component/app/api/lib/authCheck";

export async function GET() {
    // TODO: Fix PersonContext and add authorization
    // const sessionCheck = await checkAuth();
    // if (sessionCheck instanceof NextResponse) {
    //     return sessionCheck;
    // }

    try {
        const persons = await PersonService.getPersons();
        return NextResponse.json(persons, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching persons:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}



