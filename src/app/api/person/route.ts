import { NextResponse } from "next/server";
import PersonService from "@component/app/api/person/service";

export async function GET() {
    try {
        const persons = await PersonService.getPersons();
        return NextResponse.json(persons, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching persons:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}



