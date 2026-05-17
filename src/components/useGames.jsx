import { useState, useCallback } from 'react';

export function useGames() {

    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const url = "http://localhost:3001";

    const fetchGames = useCallback(async (search = "", category = "") => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${url}/games?search=${search}&category=${category}`);
            const dati = await response.json();
            setGames(Array.isArray(dati) ? dati : dati.games || []);
        } catch (err) {
            setError("Errore nel caricamento dei giochi");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Aggiungi gioco
    const addGame = async (nuovoGioco) => {
        try {
            await fetch(`${url}/games`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuovoGioco),
            });
        } catch (err) {
            console.error("Errore aggiunta gioco", err);
        }
    };

    // Elimina Gioco
    const deleteGame = async (id) => {
        try {
            await fetch(`${url}/games/${id}`, {
                method: "DELETE",
            });
        } catch (err) {
            console.error("Errore eliminazione gioco", err);
        }
    };

    // Modifica gioco
    const updateGame = async (id, datiAggiornati) => {
        try {
            await fetch(`${url}/games/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datiAggiornati),
            });
        } catch (err) {
            console.error("Errore modifica gioco", err);
        }
    };

    return {
        games,
        loading,
        error,
        fetchGames,
        addGame,
        deleteGame,
        updateGame
    };
}