import { useEffect, useState } from 'react'
import './App.css'
import { useGames } from './components/useGames'
import GameModal from './components/GameModal'

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
  const [gameToEdit, setGameToEdit] = useState(null)

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

  // Caricamento lista principale
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

  // Logica modale
  const handleSave = async (formData) => {
    if (gameToEdit) {
      await updateGame(gameToEdit.id, formData);
    } else {
      await addGame(formData);
    }
    fetchGames(debouncedSearch, category);
  };


  return (
    <div style={{ backgroundColor: "#f4f6f8", minHeight: "100vh" }}>

      {/* NAVBAR */}
      <nav className="navbar navbar-dark bg-dark px-4 mb-4 shadow-sm">
        <span className="navbar-brand fw-bold fs-4">🎮 GameCompare</span>
        {!selectedGameId && (
          <button
            onClick={() => { setGameToEdit(null); setModalOpen(true); }}
            className="btn btn-outline-light btn-sm"
          >
            + Aggiungi Gioco
          </button>
        )}
      </nav>

      <div className="container pb-5">
        {!selectedGameId ? (
          <>
            {/* SEZIONE FILTRI */}
            <div className="card border-0 shadow-sm mb-4 p-3">
              <div className="row g-3">
                <div className="col-md-4">
                  <input type="search" className="form-control"
                    placeholder="🔍 Cerca titolo..."
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
                    <option value="asc">A → Z</option>
                    <option value="desc">Z → A</option>
                  </select>
                </div>
              </div>
            </div>

            {/* STATI VUOTI / LOADING / ERRORE */}
            {loading && (
              <div className="text-center py-5 text-secondary">
                <div className="spinner-border mb-2" role="status" />
                <p>Caricamento...</p>
              </div>
            )}
            {error && <div className="alert alert-danger">{error}</div>}
            {!loading && !error && sortedGames.length === 0 && (
              <div className="alert alert-warning text-center">Nessun gioco trovato.</div>
            )}

            {/* LISTA GIOCHI */}
            <div className="row">
              {sortedGames.map((game) => (
                <div key={game.id} className="col-md-4 mb-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <span className="badge bg-secondary mb-2">{game.category}</span>
                      <h5 className="card-title fw-bold">{game.title}</h5>
                    </div>
                    <div className="card-footer bg-white border-top d-flex flex-wrap gap-2 py-2">
                      <button onClick={() => getGameDetail(game.id)} className="btn btn-dark btn-sm flex-grow-1">
                        Dettagli
                      </button>
                      <button onClick={() => toggleFavorite(game)} className="btn btn-outline-danger btn-sm" title="Preferiti">
                        {favorites.some(f => f.id === game.id) ? '❤️' : '🤍'}
                      </button>
                      <button
                        onClick={() => addToCompare(game)}
                        className={`btn btn-sm ${compareList.some(g => g.id === game.id) ? 'btn-success' : 'btn-outline-success'}`}
                        title="Confronta"
                      >
                        ⚖️
                      </button>
                      {/* PULSANTI EDIT E DELETE */}
                      <button
                        onClick={() => { setGameToEdit(game); setModalOpen(true); }}
                        className="btn btn-outline-warning btn-sm"
                        title="Modifica"
                      >Modifica</button>
                      <button
                        onClick={async () => { await deleteGame(game.id); fetchGames(debouncedSearch, category); }}
                        className="btn btn-outline-danger btn-sm"
                        title="Elimina"
                      >Elimina</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PREFERITI */}
            {favorites.length > 0 && (
              <div className="card border-0 shadow-sm mt-2 mb-4 p-3">
                <p className="mb-0">
                  <strong>❤️ Preferiti:</strong>{" "}
                  {favorites.map(f => (
                    <span key={f.id} className="badge bg-danger me-1">{f.title}</span>
                  ))}
                </p>
              </div>
            )}

            {/* Comparatore giochi */}
            {compareList.length === 2 && (
              <div className="card border-0 shadow mt-2">
                <div className="card-header bg-dark text-white text-center fw-bold fs-5">
                  ⚖️ Confronto Record
                </div>
                <div className="card-body p-0">
                  <table className="table table-bordered table-hover align-middle text-center mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th>Caratteristica</th>
                        <th>{compareList[0].title}</th>
                        <th>{compareList[1].title}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="fw-semibold text-secondary">Prezzo</td>
                        <td>€{compareList[0].price}</td>
                        <td>€{compareList[1].price}</td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-secondary">Rating</td>
                        <td>⭐ {compareList[0].rating}</td>
                        <td>⭐ {compareList[1].rating}</td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-secondary">Developer</td>
                        <td>{compareList[0].developer}</td>
                        <td>{compareList[1].developer}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="card-footer text-center bg-white border-0 py-3">
                  <button onClick={() => setCompareList([])} className="btn btn-outline-secondary btn-sm">
                    Svuota Confronto
                  </button>
                </div>
              </div>
            )}

          </>
        ) : (
          /* PAGINA DI DETTAGLIO */
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom py-3">
              <button
                onClick={() => { setSelectedGameId(null); setDetailGame(null); }}
                className="btn btn-outline-dark btn-sm"
              >
                ← Torna alla lista
              </button>
            </div>

            {detailGame && detailGame.game ? (
              <div className="card-body p-4">
                <span className="badge bg-secondary mb-2">{detailGame.game.category}</span>
                <h1 className="fw-bold mb-3">{detailGame.game.title}</h1>
                <hr />
                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <div className="card border-0 bg-light text-center p-3">
                      <div className="text-secondary small">Prezzo</div>
                      <div className="fw-bold fs-4 text-success">€{detailGame.game.price}</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card border-0 bg-light text-center p-3">
                      <div className="text-secondary small">Rating</div>
                      <div className="fw-bold fs-4"> {detailGame.game.rating} / 10</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card border-0 bg-light text-center p-3">
                      <div className="text-secondary small">Sviluppatore</div>
                      <div className="fw-bold">{detailGame.game.developer}</div>
                    </div>
                  </div>
                </div>
                <p className="text-secondary fs-6">{detailGame.game.description}</p>
              </div>
            ) : (
              <div className="text-center py-5 text-secondary">
                <div className="spinner-border mb-2" role="status" />
                <p>Caricamento...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALE CRUD */}
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