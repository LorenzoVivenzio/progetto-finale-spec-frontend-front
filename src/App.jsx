import { useEffect, useState } from 'react'
import './App.css'
import { useGames } from "./components/useGames";
import GameModal from "./components/GameModal";

function App() {

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [order, setOrder] = useState("asc")

  // STATI PER IL DETTAGLIO
  const [selectedGameId, setSelectedGameId] = useState(null)
  const [detailGame, setDetailGame] = useState(null)

  // STATI PER PREFERITI (Local Storage) E COMPARATORE
  const [favorites, setFavorites] = useState(() => {
    const datiSalvati = localStorage.getItem("miei_preferiti");
    return datiSalvati ? JSON.parse(datiSalvati) : [];
  })
  const [compareList, setCompareList] = useState([])

  // Stato per il Debounce
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // STATI PER IL MODALE CRUD
  const [modalOpen, setModalOpen] = useState(false)
  const [gameToEdit, setGameToEdit] = useState(null) // null = create, oggetto = edit

  // Hook custom CRUD
  const { games, loading, error, fetchGames, addGame, deleteGame, updateGame } = useGames()

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => {
      clearTimeout(timer)
    }
  }, [search])

  // Local Storage sui preferiti
  useEffect(() => {
    localStorage.setItem("miei_preferiti", JSON.stringify(favorites))
  }, [favorites])

  // Caricamento lista principale (ora usa fetchGames dal hook)
  useEffect(() => {
    fetchGames(debouncedSearch, category)
  }, [debouncedSearch, category, fetchGames])

  // Dettagli gioco
  async function getGameDetail(id) {
    setDetailGame(null)
    setSelectedGameId(id)
    try {
      const response = await fetch(`http://localhost:3001/games/${id}`);
      const dati = await response.json();
      setDetailGame(dati);
    } catch (error) {
      console.error("Errore caricamento dettaglio");
    }
  }

  // Ordinamento
  const sortedGames = [...games].sort((a, b) => {
    if (order === "asc") return a.title.localeCompare(b.title)
    return b.title.localeCompare(a.title)
  })

  // Logica Preferiti
  const toggleFavorite = (game) => {
    const isFav = favorites.find(f => f.id === game.id);
    if (isFav) {
      setFavorites(favorites.filter(f => f.id !== game.id));
    } else {
      setFavorites([...favorites, game]);
    }
  };

  // Logica comparatore
  const addToCompare = async (game) => {
    const alreadyIn = compareList.find(g => g.id === game.id);
    if (alreadyIn) {
      setCompareList(compareList.filter(g => g.id !== game.id));
      return;
    }

    if (compareList.length < 2) {
      try {
        const response = await fetch(`http://localhost:3001/games/${game.id}`);
        const dati = await response.json();

        const gameData = dati.game ? dati.game : dati;
        setCompareList([...compareList, gameData]);
      } catch (error) {
        console.error("Errore nel recupero dati per confronto");
      }
    } else {
      alert("Puoi confrontare massimo 2 giochi!");
    }
  };

  // Logica modale: salva sia in create che in edit
  const handleSave = (formData) => {
    if (gameToEdit) {
      updateGame(gameToEdit.id, formData);
    } else {
      addGame(formData);
    }
  };


  return (
    <div className="container mt-5">
      {!selectedGameId ? (
        <>
          <h1 className="text-center mb-4">Lista giochi</h1>

          {/* PULSANTE AGGIUNGI */}
          <div className="mb-3">
            <button
              onClick={() => { setGameToEdit(null); setModalOpen(true); }}
              className="btn btn-success"
            >
              + Aggiungi Gioco
            </button>
          </div>

          {/* SEZIONE FILTRI */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <input type="search" className="form-control"
                placeholder="Cerca titolo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="col-md-4">
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Tutte le categorie</option>
                <option value="RPG">RPG</option>
                <option value="Action">Action</option>
                <option value="Adventure">Adventure</option>
                <option value="Simulation">Simulation</option>
              </select>
            </div>
            <div className="col-md-4">
              <select className="form-select" value={order} onChange={(e) => setOrder(e.target.value)}>
                <option value="asc">A-Z</option>
                <option value="desc">Z-A</option>
              </select>
            </div>
          </div>

          {/* STATI VUOTI / LOADING / ERRORE */}
          {loading && <div className="text-center py-4">Caricamento...</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          {!loading && !error && sortedGames.length === 0 && (
            <div className="alert alert-warning">Nessun gioco trovato.</div>
          )}

          {/* LISTA GIOCHI */}
          <div className="row">
            {sortedGames.map((game) => (
              <div key={game.id} className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body text-center">
                    <h5 className="fw-bold">{game.title}</h5>
                    <p className="badge bg-info text-dark">{game.category}</p>
                  </div>
                  <div className="card-footer bg-transparent border-0 d-flex gap-2">
                    <button onClick={() => getGameDetail(game.id)} className="btn btn-primary btn-sm flex-grow-1">Dettagli</button>
                    <button onClick={() => toggleFavorite(game)} className="btn btn-outline-danger btn-sm">
                      {favorites.some(f => f.id === game.id) ? '❤️' : '🤍'}
                    </button>
                    <button
                      onClick={() => addToCompare(game)}
                      className={`btn btn-sm ${compareList.some(g => g.id === game.id) ? 'btn-success' : 'btn-outline-success'}`}
                    >
                      Confronta
                    </button>
                    {/* PULSANTI EDIT E DELETE */}
                    <button
                      onClick={() => { setGameToEdit(game); setModalOpen(true); }}
                      className="btn btn-warning btn-sm"
                    >✏️</button>
                    <button
                      onClick={() => deleteGame(game.id)}
                      className="btn btn-danger btn-sm"
                    >🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PREFERITI */}
          {favorites.length > 0 && (
            <div className="alert alert-secondary mt-4">
              <strong>Preferiti:</strong> {favorites.map(f => f.title).join(" - ")}
            </div>
          )}

          {/* Comparatore giochi */}
          {compareList.length === 2 && (
            <div className="mt-5 p-4 border border-primary rounded bg-white shadow">
              <h2 className="text-center mb-4">⚖️ Confronto Record</h2>
              <table className="table table-bordered align-middle text-center">
                <thead className="table-light">
                  <tr>
                    <th>Caratteristica</th>
                    <th>{compareList[0].title}</th>
                    <th>{compareList[1].title}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Prezzo</strong></td>
                    <td>€{compareList[0].price}</td>
                    <td>€{compareList[1].price}</td>
                  </tr>
                  <tr>
                    <td><strong>Rating</strong></td>
                    <td>⭐ {compareList[0].rating}</td>
                    <td>⭐ {compareList[1].rating}</td>
                  </tr>
                  <tr>
                    <td><strong>Developer</strong></td>
                    <td>{compareList[0].developer}</td>
                    <td>{compareList[1].developer}</td>
                  </tr>
                </tbody>
              </table>
              <div className="text-center mt-3">
                <button onClick={() => setCompareList([])} className="btn btn-secondary">Svuota Confronto</button>
              </div>
            </div>
          )}

        </>
      ) : (
        /* PAGINA DI DETTAGLIO */
        <div className="card shadow-lg p-4">
          <div className="mb-4">
            <button onClick={() => { setSelectedGameId(null); setDetailGame(null); }} className="btn btn-outline-secondary">
              ← Torna alla lista
            </button>
          </div>

          {detailGame && detailGame.game ? (
            <div className="row">
              <div className="col-md-12">
                <h1 className="display-4">{detailGame.game.title}</h1>
                <span className="badge bg-primary mb-3">{detailGame.game.category}</span>
                <hr />
                <div className="alert alert-light border">
                  <h3 className="text-success fw-bold">Prezzo: €{detailGame.game.price}</h3>
                  <p className="mb-0">Valutazione: ⭐ {detailGame.game.rating} / 5</p>
                  <p className="mt-2"><strong>Sviluppatore:</strong> {detailGame.game.developer}</p>
                </div>
                <p className="fs-5">{detailGame.game.description}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-5">Caricamento...</div>
          )}
        </div>
      )}

      {/* MODALE CRUD (create / edit) */}
      {modalOpen && (
        <GameModal
          game={gameToEdit}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}

    </div>
  );
}

export default App;