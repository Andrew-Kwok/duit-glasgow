import { Person } from "@component/models/person";
import {CURRENCIES} from "@component/app/api/constants";

const EPS = 0.01

export function TranslateBalanceTableToPayFlows(persons: Person[]): String[] {
    let payFlows = [];

    for (const currency of CURRENCIES) {
        const rows = persons
            .map(person => ({ name: person.name, bal: person.balances.find(bal => bal.currency === currency)?.balance ?? 0 }))
            .filter(r => Math.abs(r.bal) >= EPS);

        if (rows.length === 0) continue;

        rows.sort((a, b) => a.bal - b.bal);

        let i = 0, j = rows.length - 1;
        while (i < j) {
            const debtor = rows[i];
            const creditor = rows[j];
            const amount = Math.min(-debtor.bal, creditor.bal);

            if (amount >= EPS) {
                payFlows.push(`${debtor.name} needs to pay ${creditor.name} ${currency} ${amount.toFixed(2)}.`);
            }

            debtor.bal += amount;
            creditor.bal -= amount;

            if (Math.abs(debtor.bal) < EPS) i++;
            if (Math.abs(creditor.bal) < EPS) j--;
        }

    }


    if (payFlows.length == 0) {
        payFlows.push("all payments resolved")
    }

    return payFlows
}

export function GetPersonMapFromPersons(persons: Person[]): Map<string, Person> {
    const personMap = new Map<string, Person>()
    persons.forEach(person => personMap.set(person.id, person))
    return personMap
}
