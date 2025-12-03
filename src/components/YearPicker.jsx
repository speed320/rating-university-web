import React, { useEffect, useRef, useState } from "react";

export default function YearPicker({
                                       years,
                                       currentYear,
                                       onYearChange,
                                       onAddYear,
                                   }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newYear, setNewYear] = useState("");
    const [modalPos, setModalPos] = useState({ top: 0, left: 0 });

    const buttonRef = useRef(null);
    const modalRef = useRef(null);

    const handleSelectChange = (e) => {
        const year = Number(e.target.value);
        if (!Number.isNaN(year)) {
            onYearChange(year);
        }
    };

    const openModal = () => {
        // Определяем координаты кнопки и открываем модалку
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setModalPos({
                top: rect.bottom + window.scrollY + 6, // немного ниже кнопки
                left: rect.left + window.scrollX, // выровнять по левому краю кнопки
            });
        }
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

    // Если модалка открыта — подстраиваем позицию (чтобы не вылезать за правый край)
    useEffect(() => {
        if (!isModalOpen) return;

        const adjust = () => {
            if (!modalRef.current) return;
            const modalWidth = modalRef.current.offsetWidth;
            const viewportLeft = window.scrollX;
            const viewportRight = window.scrollX + window.innerWidth;
            let { left } = modalPos;

            // если модалка выходит за правый край — сдвигаем её влево
            if (left + modalWidth > viewportRight - 8) {
                left = Math.max(viewportRight - modalWidth - 8, viewportLeft + 8);
            }
            // если по каким-то причинам left стал отрицательным — поправляем
            if (left < viewportLeft + 8) {
                left = viewportLeft + 8;
            }

            setModalPos((prev) =>
                prev.left === left && prev.top === prev.top ? prev : { ...prev, left }
            );
        };

        // Небольшой отложенный вызов, чтобы элемент успел вмонтироваться и иметь width
        const id = window.requestAnimationFrame(() => adjust());

        const onWin = () => {
            // при scroll/resize пересчитываем позицию кнопки относительно viewport
            if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                setModalPos((prev) => ({
                    top: rect.bottom + window.scrollY + 6,
                    left: rect.left + window.scrollX,
                }));
            }
            // чуть позже поправим по ширине модалки
            window.requestAnimationFrame(() => adjust());
        };

        window.addEventListener("resize", onWin);
        window.addEventListener("scroll", onWin, { passive: true });

        return () => {
            window.cancelAnimationFrame(id);
            window.removeEventListener("resize", onWin);
            window.removeEventListener("scroll", onWin);
        };
    }, [isModalOpen, modalPos.top, modalPos.left]);

    // Закрытие по Escape вне инпута
    useEffect(() => {
        if (!isModalOpen) return;
        const onKey = (e) => {
            if (e.key === "Escape") closeModal();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isModalOpen]);

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
                    onClick={() => (isModalOpen ? closeModal() : openModal())}
                    aria-label="Добавить год"
                    ref={buttonRef}
                >
                    +
                </button>

                {isModalOpen && (
                    <>
                        {/* backdrop на весь экран */}
                        <div
                            className="year-modal-backdrop"
                            onClick={closeModal}
                        />

                        {/* модалка фиксированно относительно viewport, координаты в modalPos */}
                        <div
                            className="year-modal"
                            ref={modalRef}
                            style={{
                                position: "fixed",
                                top: modalPos.top,
                                left: modalPos.left,
                            }}
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
                                autoFocus
                            />

                            <button
                                type="button"
                                className="year-modal-submit"
                                onClick={handleAddYear}
                            >
                                Добавить
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
