import { useState } from 'react';

function GameModal({ game, onSave, onClose }) {

    const [formData, setFormData] = useState(
        game || { title: "", category: "", price: "", rating: "", developer: "", description: "", platform: "", hours: "" }
    );

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            price: Number(formData.price),
            rating: Number(formData.rating),
            hours: Number(formData.hours),
        });
        onClose();
    };

    return (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{game ? "Modifica Gioco" : "Aggiungi Gioco"}</h5>
                        <button className="btn-close" onClick={onClose} />
                    </div>
                    <div className="modal-body">
                        <input name="title" className="form-control mb-2" placeholder="Titolo" value={formData.title} onChange={handleChange} />
                        <select name="category" className="form-select mb-2" value={formData.category} onChange={handleChange}>
                            <option value="">Categoria</option>
                            <option value="RPG">RPG</option>
                            <option value="Action">Action</option>
                            <option value="Adventure">Adventure</option>
                            <option value="Simulation">Simulation</option>
                        </select>
                        <input name="price" type="number" className="form-control mb-2" placeholder="Prezzo" value={formData.price} onChange={handleChange} />
                        <input name="rating" type="number" className="form-control mb-2" placeholder="Rating (1-5)" min="1" max="5" value={formData.rating} onChange={handleChange} />
                        <input name="developer" className="form-control mb-2" placeholder="Sviluppatore" value={formData.developer} onChange={handleChange} />
                        <input name="platform" className="form-control mb-2" placeholder="Piattaforma (es. PC, PlayStation...)" value={formData.platform} onChange={handleChange} />
                        <input name="hours" type="number" className="form-control mb-2" placeholder="Ore di gioco" value={formData.hours} onChange={handleChange} />
                        <textarea name="description" className="form-control" placeholder="Descrizione" value={formData.description} onChange={handleChange} />
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>Annulla</button>
                        <button className="btn btn-primary" onClick={handleSubmit}>Salva</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GameModal;