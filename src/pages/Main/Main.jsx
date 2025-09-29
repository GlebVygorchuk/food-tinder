import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
import { collection, addDoc, onSnapshot, doc, deleteDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import React, { useEffect, useState, useRef, useContext } from "react"
import TinderCard from 'react-tinder-card'
import Modal from "../../components/Modal/Modal"
import { AppContext } from "../../components/AppContext"
import { toast } from "react-toastify"
import { example } from "../../example"
import { database } from "../../main"

export default function Main() {
    const [userdata, setUserdata] = useState({
        name: '',
        email: ''
    })
    const [dishes, setDishes] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [favorites, setFavorites] = useState([])
    const [recipe, setRecipe] = useState({
        title: '',
        ingredients: '',
        description: '',
        index: ''
    })
    const [selectedDish, setSelectedDish] = useState('')
    const [currentDish, setCurrentDish] = useState('')
    const [alreadySaved, setAlreadySaved] = useState(false)
    const { modalActive, setModalActive } = useContext(AppContext)

    const auth = getAuth()
    const userID = auth.currentUser ? auth.currentUser.uid : null

    const navigate = useNavigate() 
    const cardRefs = useRef([])

    cardRefs.current = example.map(() => React.createRef())

    function handleSwipe(direction) {
        setAlreadySaved(false)
        const current = ( {...dishes[currentIndex]} )

        if (direction === 'right') {
            setModalActive(true)
            setCurrentDish(current)
            setSelectedDish(current)
            dishes[currentIndex] ? setRecipe(prev => ({
                ...prev,
                title: dishes[currentIndex].title,
                description: dishes[currentIndex].recipe,
                ingredients: dishes[currentIndex].ingredients
            })) : null
        }

        setCurrentIndex(prev => prev - 1)
    }

    function handleLeftScreen(id) {
        console.log(id)
        // const copy = [...dishes]
        // const index = copy.findIndex(dish => dish.id === id) + 1
        // const updated = copy.filter(item => item !== copy[index])
        // setDishes(updated)
    }

    function swipe(direction, index, favorites) {
        if (cardRefs.current[index] && cardRefs.current[index].current) {
           cardRefs.current[index].current.swipe(direction)
        }

        const current = ( {...dishes[currentIndex]} )
        setCurrentDish(current)

        setAlreadySaved(false)
        setModalActive(
            direction === 'right' && favorites ? false : 
            direction === 'right' ? true : null 
        )
    }

    async function fetchRecipes() {
        const url = `https://68d8fc2490a75154f0d93941.mockapi.io/recipes`

        const response = await fetch(url)
        const result = await response.json()

        setDishes(result)
    }

    async function addToFavorites(e, inModal) {
        setModalActive(false)
        e.stopPropagation()
        
        if (auth.currentUser) {
            // setFavorites(prev => {
            // if (!prev.includes(dishes[currentIndex])) {
            //     toast.success('Добавлено в избранное!')
            //     !inModal ? swipe('right', currentIndex, true) : null
            //     return inModal ? [...prev, currentDish] : [...prev, selectedDish]
            // } else {
            //     toast.warn('Рецепт уже добавлен! :)')
            //     return [...prev]
            // }
            // })
            !inModal ? swipe('right', currentIndex, true) : null
            try {
                const docRef = await addDoc(collection(database, 'users', userID, 'favorites'), selectedDish)
                .then(() => console.log(`added!`))
            } 
            catch(err) {
                console.error(err)
            }
        } else {
            toast.warn('Войдите в аккаунт чтобы добавлять рецепты в избранное!')
        }
    }

    function showSavedRecipe(id) {
        setRecipe({
            index: id,
            title: favorites[id].data.title,
            description: favorites[id].data.recipe,
            ingredients: favorites[id].data.ingredients
        })
        setAlreadySaved(true)
        setModalActive(true)
    }

    async function deleteRecipe(id) {
        await deleteDoc(doc(database, 'users', userID, 'favorites', favorites[id].id))
        toast.info('Рецепт удалён')
    }

    function leave() {
        signOut(auth)
        .then(() => {
            navigate('/register')
        })
    }

    useEffect(() => {
        fetchRecipes()
    }, [])

    useEffect(() => {
        setCurrentIndex(dishes.length - 1)
    }, [dishes])

    useEffect(() => {
        setSelectedDish(dishes[currentIndex])
    }, [currentIndex])

    useEffect(() => {
        console.log(favorites)
    }, [favorites])

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, user => {
            if (user) {
                setUserdata({
                    name: auth.currentUser.displayName,
                    email: auth.currentUser.email
                })
            }
        })

        return () => unsub()
    }, [])

    useEffect(() => {
        if (userID) {
            const getFavorites = onSnapshot(collection(database, 'users', userID, 'favorites'), snapshot => {
                const docs = []
                snapshot.forEach(doc => console.log(doc.id))
                snapshot.forEach(doc => docs.push({
                    id: doc.id,
                    data: doc.data()
                }))
                setFavorites(docs)
            })

            return () => getFavorites()
        }
    }, [userID])

    return (
        <>
        <section className="main">
            <header className="main__header">
                <div className="main__header__info">
                    <h1 className="main__header__title">foodHunter</h1>
                    <p onClick={() => navigate('/about-project')} className="main__header__about-us">О проекте</p>
                    <p className="main__header__feedback">Обратная связь</p>
                </div>
                {auth.currentUser ? <svg onClick={() => leave()} fill="black" width='27.5' data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M10.95 15.84h-11V.17h11v3.88h-1V1.17h-9v13.67h9v-2.83h1v3.83z"/><path d="M5 8h6v1H5zM11 5.96l4.4 2.54-4.4 2.54V5.96z"/></svg> : null}
            </header>
            <main className="main__main">
                <aside className="main__info">
                <div className="main__info__profile">
                    <p className="main__info__greetings">{auth.currentUser ? `Добро пожаловать, ${userdata.name}!` : 'Вы не вошли в аккаунт :('}</p>
                </div>
                {auth.currentUser ? 
                <div className="main__info__saved">
                    <p className="main__info__title">Сохранённые блюда:</p>
                    {favorites.map((item, index) => 
                    <div key={item.data.id} onClick={() => showSavedRecipe(index)} className="main__info__favorite">
                        <p className="main__info__favorite__title">{item.data.title}</p>
                        <img className="main__info__favorite__image" src={item.data.image} alt="" />
                    </div>
                    )}
                </div> : 
                <div className="unauthorized">
                    Чтобы сохранять рецепты, войдите в аккаунт =&gt;
                    <button onClick={() => navigate('/register')} style={{marginTop: '10px'}} className="unauthorized__button">Регистрация</button>
                    <button onClick={() => navigate('/login')} className="unauthorized__button">Войти</button>
                </div>
                }
            </aside>
            <div className="main__cards-container">
                <div id="swipeLeft" className="main__cards__hint">
                    <svg id="fingerLeft" width={40} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M27 11h-8.52L19 9.8A6.42 6.42 0 0 0 13 1a1 1 0 0 0-.93.63L8.32 11H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h18.17a3 3 0 0 0 2.12-.88l3.83-3.83a3 3 0 0 0 .88-2.12V14a3 3 0 0 0-3-3zM4 28V14a1 1 0 0 1 1-1h3v16H5a1 1 0 0 1-1-1zm24-3.83a1 1 0 0 1-.29.71l-3.83 3.83a1.05 1.05 0 0 1-.71.29H10V12.19l3.66-9.14a4.31 4.31 0 0 1 3 1.89 4.38 4.38 0 0 1 .44 4.12l-1 2.57A1 1 0 0 0 17 13h10a1 1 0 0 1 1 1z"/></svg>
                    <svg id="arrowLeft" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M32 15H3.41l8.29-8.29-1.41-1.42-10 10a1 1 0 0 0 0 1.41l10 10 1.41-1.41L3.41 17H32z"/></svg>
                </div>
                <div id="swipeRight" className="main__cards__hint">
                    <svg id="fingerRight" width={40} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M27 11h-8.52L19 9.8A6.42 6.42 0 0 0 13 1a1 1 0 0 0-.93.63L8.32 11H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h18.17a3 3 0 0 0 2.12-.88l3.83-3.83a3 3 0 0 0 .88-2.12V14a3 3 0 0 0-3-3zM4 28V14a1 1 0 0 1 1-1h3v16H5a1 1 0 0 1-1-1zm24-3.83a1 1 0 0 1-.29.71l-3.83 3.83a1.05 1.05 0 0 1-.71.29H10V12.19l3.66-9.14a4.31 4.31 0 0 1 3 1.89 4.38 4.38 0 0 1 .44 4.12l-1 2.57A1 1 0 0 0 17 13h10a1 1 0 0 1 1 1z"/></svg>
                    <svg id="arrowRight" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M32 15H3.41l8.29-8.29-1.41-1.42-10 10a1 1 0 0 0 0 1.41l10 10 1.41-1.41L3.41 17H32z"/></svg>
                </div>
                <div className="main__cards">
                    {dishes.map((item, index) => (
                        <TinderCard
                        preventSwipe={['up', 'down']}
                        key={item.id} 
                        className="main__card"
                        onSwipe={handleSwipe}
                        onCardLeftScreen={() => handleLeftScreen(index)}
                        ref={cardRefs.current[index]}>
                            <img src={item.image} className="main__card__image"></img>
                            <h3>{item.title}</h3>
                        </TinderCard>
                    ))}
                    <div className="main__swipe-buttons">
                        <button style={{position: 'relative'}} onClick={() => swipe('left', currentIndex, false)} className="main__swipe-button">
                            <span style={{transform: 'rotate(45deg)'}} className="cross-line"></span><span style={{transform: 'rotate(-45deg)'}} className="cross-line"></span>
                        </button>
                        <button onClick={(e) => addToFavorites(e, false)} title="Добавить в избранное" className="main__swipe-button">
                            <svg style={{marginLeft: '0.33px', marginTop: '-1px'}} width='25' height='25' fill="#ffc629ff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25"><path d="m18.25 15.52 1.36 7.92-7.11-3.74-7.11 3.74 1.36-7.92L1 9.92l7.95-1.16 3.55-7.2 3.55 7.2L24 9.92z"/></svg>
                        </button>
                        <button onClick={() => swipe('right', currentIndex, false)} className="main__swipe-button">
                            <svg style={{marginTop: '1px'}} width='30' height='30' fill="#ca0043ff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20.808 11.079C19.829 16.132 12 20.5 12 20.5s-7.829-4.368-8.808-9.421C2.227 6.1 5.066 3.5 8 3.5a4.444 4.444 0 0 1 4 2 4.444 4.444 0 0 1 4-2c2.934 0 5.773 2.6 4.808 7.579z"/></svg>
                        </button>
                    </div>
                </div>
            </div>
            </main>
        </section>
        <Modal>
            <div className="recipe-modal">
                <div className="recipe-modal__title">{recipe.title}                 
                    {!alreadySaved ? <button onClick={(e) => addToFavorites(e, true)} title="Добавить в избранное" id="add" className="main__swipe-button">
                    <svg style={{marginLeft: '0.33px', marginTop: '-1.5px'}} width='25' height='25' fill="#ffc629ff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25"><path d="m18.25 15.52 1.36 7.92-7.11-3.74-7.11 3.74 1.36-7.92L1 9.92l7.95-1.16 3.55-7.2 3.55 7.2L24 9.92z"/></svg>
                </button> : <button id="deleteRecipe" onClick={() => deleteRecipe(recipe.index)} className="main__swipe-button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 5a1 1 0 0 1-1 1H3a1 1 0 0 1 0-2h5V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1h5a1 1 0 0 1 1 1zM4.934 21.071 4 8h16l-.934 13.071a1 1 0 0 1-1 .929H5.931a1 1 0 0 1-.997-.929zM15 18a1 1 0 0 0 2 0v-6a1 1 0 0 0-2 0zm-4 0a1 1 0 0 0 2 0v-6a1 1 0 0 0-2 0zm-4 0a1 1 0 0 0 2 0v-6a1 1 0 0 0-2 0z"/></svg></button>}
                </div>
                <ul className="recipe-modal__ingredients">
                    {recipe.ingredients && recipe.ingredients.map(item => <li>{item}</li>)}
                </ul>
                <hr />
                <div className="recipe-modal__description">{recipe.description}</div>
            </div>
        </Modal>
        </>
    )
}