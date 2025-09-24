import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import React, { useEffect, useState, useRef, useContext } from "react"
import TinderCard from 'react-tinder-card'
import Modal from "../../components/Modal/Modal"
import { AppContext } from "../../components/AppContext"
import { toast } from "react-toastify"
import { example } from "../../example"

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
        description: '',
        index: ''
    })
    const [selectedDish, setSelectedDish] = useState(dishes[currentIndex])
    const [currentDish, setCurrentDish] = useState('')
    const [alreadySaved, setAlreadySaved] = useState(false)
    const { modalActive, setModalActive } = useContext(AppContext)

    const auth = getAuth()
    const navigate = useNavigate() 
    const cardRefs = useRef([])

    cardRefs.current = example.map(() => React.createRef())

    function handleSwipe(direction) {
        const current = ( {...dishes[currentIndex]} )

        if (direction === 'right') {
            setSelectedDish(current)
            dishes[currentIndex] ? setRecipe(prev => ({
                ...prev,
                title: dishes[currentIndex].title,
                description: dishes[currentIndex].recipe
            })) : null
        }
    }

    // function handleLeftScreen(id) {
    //     const copy = [...dishes]
    //     const index = copy.findIndex(dish => dish.id === id) + 1
    //     const updated = copy.filter(item => item !== copy[index])
    //     setDishes(updated)
    // }

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

        setCurrentIndex(prev => prev - 1)
    }

    async function fetchRecipes() {
        const apiKey = 'ca397846249d4d9bb87fb1872de0c844'
        const url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&number=10&addRecipeInformation=true`

        const response = await fetch(url)
        const result = await response.json()

       //setDishes(result.results)
       setDishes(example)
    }

    function leave() {
        signOut(auth)
        .then(() => {
            navigate('/register')
        })
    }

    function addToFavorites(e, inModal) {
        setModalActive(false)
        e.stopPropagation()
        if (auth.currentUser) {
            setFavorites(prev => {
            if (!prev.includes(dishes[currentIndex])) {
                toast.success('Добавлено в избранное!')
                !inModal ? swipe('right', currentIndex, true) : null
                return inModal ? [...prev, currentDish] : [...prev, selectedDish]
            } else {
                toast.warn('Рецепт уже добавлен! :)')
                return [...prev]
            }
        })
        } else {
            toast.warn('Войдите в аккаунт чтобы добавлять рецепты в избранное!')
        }
    }

    function showSavedRecipe(id) {
        setRecipe({
            index: id,
            title: favorites[id].title,
            description: favorites[id].recipe
        })
        setAlreadySaved(true)
        setModalActive(true)
    }

    function deleteRecipe(id) {
        setFavorites(() => {
            const updated = [...favorites]
            updated.splice(favorites[id], 1)
            return updated
        })
        toast.info('Рецепт удалён')
    }

    useEffect(() => {
        fetchRecipes()
    }, [])

    useEffect(() => {
        console.log(selectedDish)
    }, [selectedDish])

    useEffect(() => {
        setCurrentIndex(dishes.length - 1)
    }, [dishes])

    useEffect(() => {
        setSelectedDish(dishes[currentIndex])
    }, [currentIndex])

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

    return (
        <>
        <section className="main">
            <aside className="main__info">
                <div className="main__info__profile">
                    <p className="main__info__greetings">{auth.currentUser ? `Добро пожаловать, ${userdata.name}!` : 'Вы не вошли в аккаунт :('}</p>
                    <svg onClick={() => leave()} fill="black" width='30' data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M10.95 15.84h-11V.17h11v3.88h-1V1.17h-9v13.67h9v-2.83h1v3.83z"/><path d="M5 8h6v1H5zM11 5.96l4.4 2.54-4.4 2.54V5.96z"/></svg>
                </div>
                {auth.currentUser ? 
                <div className="main__info__saved">
                    <p className="main__info__title">Сохранённые блюда:</p>
                    {favorites.map((item, index) => 
                    <div key={item.id} onClick={() => showSavedRecipe(index)} className="main__info__favorite">
                        <p className="main__info__favorite__title">{item.title}</p>
                        <img className="main__info__favorite__image" src="src/assets/onigiri.jpg" alt="" />
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
                <div className="main__cards">
                    {dishes.map((item, index) => (
                        <TinderCard
                        preventSwipe={['up', 'down']}
                        key={item.id} 
                        className="main__card"
                        onSwipe={handleSwipe}
                        onCardLeftScreen={() => handleLeftScreen(index)}
                        ref={cardRefs.current[index]}>
                            <img src="src/assets/onigiri.jpg" className="main__card__image" />
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
        </section>
        <Modal>
            <div className="recipe-modal">
                <div className="recipe-modal__title">{recipe.title}                 
                    {!alreadySaved ? <button onClick={(e) => addToFavorites(e, true)} title="Добавить в избранное" id="add" className="main__swipe-button">
                    <svg style={{marginLeft: '0.33px', marginTop: '-1.5px'}} width='25' height='25' fill="#ffc629ff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25"><path d="m18.25 15.52 1.36 7.92-7.11-3.74-7.11 3.74 1.36-7.92L1 9.92l7.95-1.16 3.55-7.2 3.55 7.2L24 9.92z"/></svg>
                </button> : <button id="deleteRecipe" onClick={() => deleteRecipe(recipe.index)} className="main__swipe-button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 5a1 1 0 0 1-1 1H3a1 1 0 0 1 0-2h5V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1h5a1 1 0 0 1 1 1zM4.934 21.071 4 8h16l-.934 13.071a1 1 0 0 1-1 .929H5.931a1 1 0 0 1-.997-.929zM15 18a1 1 0 0 0 2 0v-6a1 1 0 0 0-2 0zm-4 0a1 1 0 0 0 2 0v-6a1 1 0 0 0-2 0zm-4 0a1 1 0 0 0 2 0v-6a1 1 0 0 0-2 0z"/></svg></button>}
                </div>
                <div className="recipe-modal__description">{recipe.description}</div>
            </div>
        </Modal>
        </>
    )
}