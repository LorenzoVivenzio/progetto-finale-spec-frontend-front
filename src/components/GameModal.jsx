import { useState } from 'react';

function GameModal({ game, onSave, onClose }) {

    const [formData, setFormData] = useState(
        game ? {
            title: game.title || "",
            category: game.category || "",
            price: game.price ?? "",
            rating: game.rating ?? "",
            developer: game.developer || "",
            description: game.description || "",
            platform: game.platform || "",
            hours: game.hours ?? "",
        } : { title: "", category: "", price: "", rating: "", developer: "", description: "", platform: "", hours: "" }
    );

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            title: formData.title,
            category: formData.category,
            description: formData.description,
            developer: formData.developer,
            platform: formData.platform,
            price: Number(formData.price),
            rating: Number(formData.rating),
            hours: Number(formData.hours),
        });
        onClose();
    };

    return (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">

                    <div className="modal-header bg-dark text-white border-0 px-4 py-3">
                        <h5 className="modal-title fw-bold">
                            {game ? "✏️ Modifica Gioco" : "➕ Aggiungi Gioco"}
                        </h5>
                        <button className="btn-close btn-close-white" onClick={onClose} />
                    </div>

                    <div className="modal-body px-4 py-3">
                        <div className="mb-3">
                            <label className="form-label fw-semibold text-secondary small">Titolo</label>
                            <input name="title" className="form-control" placeholder="Es. The Witcher 3" value={formData.title} onChange={handleChange} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold text-secondary small">Categoria</label>
                            <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
                                <option value="">Seleziona categoria</option>
                                <option value="RPG">RPG</option>
                                <option value="Action">Action</option>
                                <option value="Adventure">Adventure</option>
                                <option value="Simulation">Simulation</option>
                            </select>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-6">
                                <label className="form-label fw-semibold text-secondary small">Prezzo (€)</label>
                                <input name="price" type="number" className="form-control" placeholder="Es. 29.99" value={formData.price} onChange={handleChange} />
                            </div>
                            <div className="col-6">
                                <label className="form-label fw-semibold text-secondary small">Rating (1-5)</label>
                                <input name="rating" type="number" className="form-control" placeholder="Es. 4" min="1" max="5" value={formData.rating} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-6">
                                <label className="form-label fw-semibold text-secondary small">Sviluppatore</label>
                                <input name="developer" className="form-control" placeholder="Es. CD Projekt" value={formData.developer} onChange={handleChange} />
                            </div>
                            <div className="col-6">
                                <label className="form-label fw-semibold text-secondary small">Piattaforma</label>
                                <input name="platform" className="form-control" placeholder="Es. PC, PS5..." value={formData.platform} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold text-secondary small">Ore di gioco</label>
                            <input name="hours" type="number" className="form-control" placeholder="Es. 60" value={formData.hours} onChange={handleChange} />
                        </div>
                        <div className="mb-1">
                            <label className="form-label fw-semibold text-secondary small">Descrizione</label>
                            <textarea name="description" className="form-control" rows="3" placeholder="Breve descrizione del gioco..." value={formData.description} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="modal-footer border-0 px-4 pb-3 pt-2 gap-2">
                        <button className="btn btn-outline-secondary" onClick={onClose}>Annulla</button>
                        <button className="btn btn-dark px-4" onClick={handleSubmit}>Salva</button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default GameModal;