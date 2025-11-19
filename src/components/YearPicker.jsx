import React, { useState } from "react";

export default function YearPicker({
                                       years,
                                       currentYear,
                                       onYearChange,
                                       onAddYear,
                                   }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newYear, setNewYear] = useState("");

    const handleSelectChange = (e) => {
        const year = Number(e.target.value);
        if (!Number.isNaN(year)) {
            onYearChange(year);
        }
    };

    const openModal = () => {
        setNewYear("");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setNewYear("");
    };

    const handleAddYear = () => {
        const yearNum = Number(newYear.trim());
        if (!yearNum || Number.isNaN(yearNum)) return;
        if (years.includes(yearNum)) {
            // уже есть такой год — просто переключимся на него
            onYearChange(yearNum);
            closeModal();
            return;
        }
        onAddYear(yearNum);
        closeModal();
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddYear();
        }
        if (e.key === "Escape") {
            e.preventDefault();
            closeModal();
        }
    };

    return (
        <>
            <div className="year-picker">
                <select
                    className="year-select"
                    value={currentYear}
                    onChange={handleSelectChange}
                >
                    {years.map((y) => (
                        <option key={y} value={y}>
                            {y}
                        </option>
                    ))}
                </select>

                <button
                    type="button"
                    className="year-add-button"
                    onClick={openModal}
                    aria-label="Добавить год"
                >
                    +
                </button>
            </div>

            {isModalOpen && (
                <div className="year-modal-backdrop" onClick={closeModal}>
                    <div
                        className="year-modal"
                        onClick={(e) => e.stopPropagation()} // чтобы клик по модалке не закрывал её
                    >
                        <div className="year-modal-header">
                            <div className="year-modal-title">Ввести новый параметр года</div>
                            <button
                                type="button"
                                className="year-modal-close"
                                onClick={closeModal}
                                aria-label="Закрыть"
                            >
                                ×
                            </button>
                        </div>

                        <input
                            type="number"
                            className="year-modal-input"
                            placeholder="Введите год"
                            value={newYear}
                            onChange={(e) => setNewYear(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />

                        <button
                            type="button"
                            className="year-modal-submit"
                            onClick={handleAddYear}
                        >
                            Добавить
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
