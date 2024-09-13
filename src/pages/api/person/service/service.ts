import {Person} from "@component/models/person";
import PersonSql from "@component/pages/api/person/service/sql";

export default {
    getPersons,
    fetchPersonById,
    updateBalances,
    updateBalancesWithMap
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

async function updateBalances(newPersonBalances: Person[]): Promise<void> {
    await PersonSql.updateBalances(newPersonBalances);
}

async function updateBalancesWithMap(newBalance: Map<string, number>): Promise<void> {
    const persons = await getPersons();
    const personMap = new Map(persons.map(person => [person.id, person]));

    for (const entry of Array.from(newBalance.entries())) {
        const [id, balance] = entry;
        const person = personMap.get(id); // Convert `id` to a string if necessary
        if (!person) {
            throw new Error(`Person with ID ${id} not found`);
        }
        personMap.set(id, { ...person, balance: balance });
    }

    const updatedBalance = Array.from(personMap.values());
    await updateBalances(updatedBalance);
}