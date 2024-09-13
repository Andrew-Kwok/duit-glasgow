import {Person} from "@component/models/person";

export function TranslateBalanceTableToPayFlows(persons: Person[]): String[] {
    const personsCopy = persons.map(person => ({...person}))
    personsCopy.sort((a, b) => a.balance - b.balance)

    let i = 0, j = personsCopy.length - 1, payFlows = []
    while (i < j) {
        const debtor = personsCopy[i]
        const creditor = personsCopy[j]
        const amount = Math.min(-debtor.balance, creditor.balance)

        debtor.balance += amount
        creditor.balance -= amount

        if (amount >= 0.01) {
            payFlows.push(`${debtor.name} needs to pay ${creditor.name} $${amount.toFixed(2)}.`)
        }

        if (debtor.balance == 0) {
            i++
        }
        if (creditor.balance == 0) {
            j--
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
