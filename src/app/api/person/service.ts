import {Balance, Person} from "@component/models/person";
import PersonSql from "@component/app/api/person/sql";

export default {
    getPersons,
    addBalancesByDelta
}

async function getPersons(): Promise<Person[]> {
    return await PersonSql.getPersons();
}

async function fetchPersonById(personId: string): Promise<Person> {
    const person = await PersonSql.getPersonById(personId);
    if (!person) {
        throw new Error(`Person with ID ${personId} not found`);
    }

    return person;
}

async function addBalancesByDelta(balanceDelta: Balance[]): Promise<void> {
    await PersonSql.addBalancesByDelta(balanceDelta);
}
