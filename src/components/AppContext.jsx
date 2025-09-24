import { createContext, useState } from "react"

export const AppContext = createContext()

export default function ContextProvider({ children }) {
    const [modalActive, setModalActive] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    
    function closeModal() {
        setModalActive(false)
    }
    
    return <AppContext.Provider value={{modalActive, setModalActive, closeModal, currentIndex, setCurrentIndex}}>{children}</AppContext.Provider>
}