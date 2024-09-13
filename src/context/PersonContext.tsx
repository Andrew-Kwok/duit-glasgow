import React, {createContext, ReactNode, useEffect, useState} from 'react';
import {Person} from "@component/models/person";

interface PersonContextType {
    persons: Person[];
    refreshPersons: () => void;
}

export const PersonContext = createContext<PersonContextType>({
    persons: [],
    refreshPersons: () => {},
});

export const PersonProvider = ({ children }: { children: ReactNode }) => {
    const [persons, setPersons] = useState<Person[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const refreshPersons = async (): Promise<void> => {
        try {
            const response = await fetch('/api/person/get');
            setPersons(await response.json());
        } catch (error) {
            setError(error instanceof Error ? error.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshPersons();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <PersonContext.Provider value={{ persons, refreshPersons }}>
            {children}
        </PersonContext.Provider>
    );
};