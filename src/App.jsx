import { useEffect, useState } from 'react'
import './App.css'

function App() {

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [games, setGames] = useState([])
  const [order, setOrder] = useState("asc")
  const [selectGame, setSelectGame] = useState(null)
  const [detailGame, setDetailGame] = useState(null)



  async function getGames() {
    try {
      const response = await fetch(`http://localhost:3001/games?search=${search}&category=${category}`);
      const dati = await response.json()
      setGames(dati)
    } catch (error) {
      console.error("Errore nel caricamento")
    }
  }


  //FUNZIONE : ORDINE ALFABETICO
  const sortedGames = [...games].sort((a, b) => {
    if (order === "asc") {
      return a.title.localeCompare(b.title)
    } else {
      return b.title.localeCompare(a.title)
    }
  })

  async function getDetailGame(id) {

    try {

      const response = await fetch(`http://localhost:3001/games/${id}`)
      const dati = await response.json()
      setSelectGame(id)
      setDetailGame(dati)

    } catch (error) {

      console.error("Dati non validi")
    }
  }

  useEffect(() => {
    getGames()
  }, [search, category])


  return (
    <>
      <section className="container mt-5">
        <h1 className='text-center mb-4'>Comparatore Videogiochi</h1>

        <div className="row g-3 mb-5">
          {/* BARRA DI RICERCA */}
          <div className="col-md-6">
            <input
              className='form-control'
              placeholder='Cerca per titolo (es. Elden Ring...)'
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* SELECT PER CATEGORIA */}
          <div className="col-md-6">
            <select
              className="form-select"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="">Tutte le categorie</option>
              <option value="RPG">RPG</option>
              <option value="Adventure">Adventure</option>
              <option value="Action">Action</option>
              <option value="Platform">Platform</option>
              <option value="Sandbox">Sandbox</option>
            </select>
          </div>

          {/* SELEC PER ORDINE ALFABETICO*/}
          <div className="col-md-12 mt-3">
            <label className="form-label fw-bold">Ordina per Titolo:</label>
            <select
              className="form-select"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            >
              <option value="asc">Alfabetico (A-Z)</option>
              <option value="desc">Alfabetico (Z-A)</option>
            </select>
          </div>

        </div>

        {/* LISTA RECORD */}
        <div className="row">
          {sortedGames.map((game) => (
            <div key={game.id} className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <h5 className="card-title fw-bold text-primary">{game.title}</h5>
                  <p className="badge bg-secondary">{game.category}</p>
                </div>
                <div className="card-footer bg-transparent border-top-0 text-center">
                  <button className="btn btn-primary w-100">Dettagli</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Messaggio se non ci sono risultati */}
        {sortedGames.length === 0 && (
          <p className="text-center mt-4">Nessun gioco trovato con questi filtri.</p>
        )}
      </section>
    </>
  )
}

export default App
