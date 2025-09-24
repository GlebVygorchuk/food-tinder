import { useContext } from "react"
import { AppContext } from "../AppContext"

export default function Modal({ children }) {
    const { modalActive, setModalActive, closeModal, currentIndex, setCurrentIndex } = useContext(AppContext)

    return (
        <div onClick={() => setModalActive(false)} className={`backdrop ${modalActive ? 'active' : ''}`}>
            <div className={`modal ${modalActive ? 'active' : ''}`}>
                {children}
                <div className="button-wrapper">
                    <button className="modal__close-button" onClick={() => setModalActive(false)}>
                        <span id="line-1"></span><span id="line-2"></span>
                    </button>
                </div>
            </div>
        </div>
    )
}