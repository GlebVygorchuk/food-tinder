import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
import { collection, addDoc, onSnapshot, doc, deleteDoc, getDocs, query, where } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import React, { useEffect, useState, useRef, useContext, useMemo, useCallback } from "react"
import TinderCard from 'react-tinder-card'
import Loader from "../../components/Loader"
import Modal from "../../components/Modal/Modal"
import { AppContext } from "../../components/AppContext"
import { toast } from "react-toastify"
import { database } from "../../main"
import { recipes } from "../../example"

export default function Main() {
    const [userdata, setUserdata] = useState({
        name: '',
        email: ''
    })
    const [dishes, setDishes] = useState([])
    const [allDishes, setAllDishes] = useState([])
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
    const [loading, setLoading] = useState(false)
    const [filters, setFilters] = useState({
        showCuisine: false,
        healthy: false,
        vegetarian: false
    })
    const [mobileFilters, setMobileFilters] = useState(false)
    const [cuisine, setCuisine] = useState('Кухня')
    const [currentArray, setCurrentArray] = useState([])
    const [cardsLeft, setCardsLeft] = useState(7)
    const [slicePoints, setSlicePoints] = useState({
        start: 0,
        end: 7
    })
    const { modalActive, setModalActive } = useContext(AppContext)

    const auth = getAuth()
    const userID = auth.currentUser ? auth.currentUser.uid : null

    const navigate = useNavigate() 

    const cardRefs = useRef([])
    const favoritesRef = useRef([])
    const indexRef = useRef(null)
    const userIdRef = useRef(null)

    const handleSwipe = useCallback((direction) => {
        setAlreadySaved(false)
        const current = ( {...dishes[currentIndex]} )

        if (direction === 'right') {
            setModalActive(true)
            setCurrentDish(current)
            setSelectedDish(current)
            const index = indexRef.current
            dishes[index] ? setRecipe(prev => ({
                ...prev,
                title: dishes[index].title,
                description: dishes[index].recipe,
                ingredients: dishes[index].ingredients
            })) : null
        }

        setCardsLeft(prev => prev - 1)
        setCurrentIndex(prev => prev - 1)
    }, [currentIndex, dishes])

    function handleLeftScreen(id) {
        // const copy = [...dishes]
        // const index = copy.findIndex(dish => dish.id === id) + 1
        // const updated = copy.filter(item => item !== copy[index])
        // setDishes(updated)
    }

    function swipe(direction, index, favorites) {
        if (cardRefs.current[index] && cardRefs.current[index].current) {
           cardRefs.current[index].current.swipe(direction)
        }

        setCurrentDish(() => {
            const current = ( {...dishes[index]} )
            return current
        })

        setAlreadySaved(false)
        setModalActive(
            direction === 'right' && favorites ? false : 
            direction === 'right' ? true : null 
        )
    }

    async function fetchRecipes() {
        setLoading(true)

        // const url = `https://68d8fc2490a75154f0d93941.mockapi.io/recipes`
        // Здесь должен быть запрос на MockAPI, но он почему то не работает

        try {
            // const response = await fetch(url)
            // const result = await response.json()

            const pack = recipes.slice(slicePoints.start, slicePoints.end)

            setDishes(pack)
            setAllDishes(recipes)
            setCurrentArray(recipes)
            setLoading(false)
            setRecipe(prev => ({
                ...prev, 
                title: pack[pack.length - 1].title,
                ingredients: pack[pack.length - 1].ingredients,
                description: pack[pack.length - 1].recipe
            }))
        } catch (error) {
            console.log(error)
        }
    }

    const addToFavorites = useCallback(async (index, inModal) => {
        try {
            console.log(userIdRef.current)
            const docsRef = collection(database, 'users', userIdRef.current, 'favorites')
            
            const favorite = dishes[index]
            console.log(favorite)

            if (!auth.currentUser) {
                toast.warn('Войдите в аккаунт чтобы добавлять рецепты в избранное!')
                return
            }

            const hasDublicate = favoritesRef.current.some(fav => fav.data.id === favorite.id)

            !inModal ? swipe('right', index, true) : null
            !hasDublicate ? await addDoc(docsRef, favorite).then(() => 
                toast.success('Сохранено!')) : 
                toast.warn('Рецепт уже добавлен :)'
            ) 
        }
        catch (error) {
            console.log(error)
        }
        finally {
            setModalActive(false)
        }
    }, [dishes]) 

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
        let fav = document.getElementById(favorites[id].id)
        fav.classList.add('vanish')
        setTimeout(() => {
            deleteDoc(doc(database, 'users', userID, 'favorites', favorites[id].id))
            toast.info('Рецепт удалён')
        }, 250)      
    }

    async function wipe() {
        favorites.forEach(item => {
            const fav = document.getElementById(item.id)
            fav.classList.add('vanish')
        })
        const favs = await getDocs(collection(database, 'users', userID, 'favorites'))
        setTimeout(() => {
            favs.docs.forEach(async (fav) => {
                await deleteDoc(doc(database, 'users', userID, 'favorites', fav.id))
            })
            if (favs.size > 0) {
                toast.info('Рецепты удалены')
            }
        }, 250)
    }

    function chooseCuisine(cuisine) {
        setCuisine(cuisine)
        setFilters(prev => ({
            ...prev, 
            showCuisine: false
        }))
    }

    function leave() {
        signOut(auth)
        .then(() => {
            navigate('/register')
        })
    }

    useEffect(() => {
        console.log('ID loaded!')
        userIdRef.current = userID
    }, [userID])

    useEffect(() => {
        console.log(dishes)
    }, [dishes])

    useEffect(() => {
        const copy = [...allDishes]

        const filtered = copy.filter(item => {
            const matchCuisine = cuisine === 'Кухня' || item.cuisine === cuisine
            const matchHealthy = !filters.healthy || item.healthy
            const matchVegetarian = !filters.vegetarian || item.vegetarian

            return matchCuisine && matchHealthy && matchVegetarian
        })

        setDishes(filtered)
        setCurrentArray(filtered)
    }, [filters.healthy, filters.vegetarian, cuisine])

    useEffect(() => {
        if (cardsLeft === 0) {
            setLoading(true)
            setTimeout(() => {
                setSlicePoints(prev => {
                    const newSlicePoints = {
                        start: prev.start + 7, 
                        end: prev.end + 7
                    }
                    const pack = [...currentArray].slice(newSlicePoints.start, newSlicePoints.end)
                    setDishes(pack)
                    setCardsLeft(pack.length)
                    return newSlicePoints
                }) 
                setLoading(false)
            }, 500)
        }
    }, [cardsLeft, currentArray])

    useEffect(() => console.log(cardsLeft), [cardsLeft])

    useEffect(() => {
        setSlicePoints(() => {
            const newSlicePoints = {
                start: 0, 
                end: 7
            }
            const pack = [...currentArray].slice(newSlicePoints.start, newSlicePoints.end)
            setDishes(pack)
            setCardsLeft(7)
            return newSlicePoints
        }) 
    }, [currentArray])
    
    useEffect(() => {
        console.log(currentArray)
        console.log(dishes)
    }, [currentArray])

    useEffect(() => {
        console.log(slicePoints)
    }, [slicePoints])

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
                snapshot.forEach(doc => docs.push({
                    id: doc.id,
                    data: doc.data()
                }))
                setFavorites(docs)
            })

            return () => getFavorites()
        }
    }, [userID])

    useEffect(() => {
        favoritesRef.current = favorites
    }, [favorites]) 

    useEffect(() => {
        indexRef.current = currentIndex
    }, [currentIndex])

    useEffect(() => {
        !mobileFilters ? setFilters(prev => ({...prev, showCuisine: false})) : null
    }, [mobileFilters])

    const memoizedCards = useMemo(() => {
        cardRefs.current = dishes.map((_, index) => {
            return cardRefs.current[index] || React.createRef()
        })

        return dishes.map((item, index) => (
            <TinderCard
            preventSwipe={['up', 'down']}
            key={item.id} 
            swipeRequirementType="position"
            swipeThreshold={50}
            className="main__card"
            onSwipe={handleSwipe}
            onCardLeftScreen={() => handleLeftScreen(index)}
            ref={cardRefs.current[index]}>
                {/* <img loading="lazy" src={item.image} className="main__card__image"></img> */}
                <h3>{item.title}</h3>
                    <div className="main__swipe-buttons">
                        <button style={{position: 'relative'}} onClick={() => swipe('left', index, false)} className="option">
                            <span id="cross" style={{transform: 'rotate(45deg)'}} className="cross-line"></span><span style={{transform: 'rotate(-45deg)'}} className="cross-line"></span>
                        </button>
                        <button onClick={() => {
                            try {
                                addToFavorites(index, false)
                            }
                            catch (error) {
                                console.log(error)
                            }
                        }} title="Добавить в избранное" className="option">
                            <svg id="star" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25"><path d="m18.25 15.52 1.36 7.92-7.11-3.74-7.11 3.74 1.36-7.92L1 9.92l7.95-1.16 3.55-7.2 3.55 7.2L24 9.92z"/></svg>
                        </button>
                        <button onClick={() => swipe('right', index, false)} className="option">
                            <svg id="like" style={{marginTop: '1px'}} width='30' height='30' fill="#ca0043ff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20.808 11.079C19.829 16.132 12 20.5 12 20.5s-7.829-4.368-8.808-9.421C2.227 6.1 5.066 3.5 8 3.5a4.444 4.444 0 0 1 4 2 4.444 4.444 0 0 1 4-2c2.934 0 5.773 2.6 4.808 7.579z"/></svg>
                        </button>
                    </div>
            </TinderCard>
        ))
    }, [dishes])

    return (
        <>
        <section className="main">
            <header className="main__header">
                <div className="main__header__info">
                    <h1 className="main__header__title">foodHunter</h1>
                    <svg className="logo" width="50" height="50" viewBox="0 0 125 89" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="63" y="3" width="59" height="83" rx="4.5" stroke="black" stroke-width="6"/>
<line x1="32" y1="46" x2="50" y2="46" stroke="black" stroke-width="4"/>
<path d="M18 68L50 68" stroke="black" stroke-width="4"/>
<line x1="23" y1="22" x2="50" y2="22" stroke="black" stroke-width="4"/>
<rect x="80" y="39" width="25" height="35" rx="2.5" fill="black"/>
<path d="M77 30.5C77 29.1193 78.1193 28 79.5 28H105.5C106.881 28 108 29.1193 108 30.5V35.5C108 36.8807 106.881 38 105.5 38H79.5C78.1193 38 77 36.8807 77 35.5V30.5Z" fill="black"/>
<path d="M97 24.6L102 15" stroke="black" stroke-width="3"/>
<path d="M97 24V27.5" stroke="black" stroke-width="3"/>
</svg>
                    <p onClick={() => navigate('/about-project')} className="main__header__about-us">О проекте</p>
                </div>
                {auth.currentUser ? <svg className="main__header__leave" onClick={() => leave()} fill="black" width='27.5' data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M10.95 15.84h-11V.17h11v3.88h-1V1.17h-9v13.67h9v-2.83h1v3.83z"/><path d="M5 8h6v1H5zM11 5.96l4.4 2.54-4.4 2.54V5.96z"/></svg> : null}
            </header>
            <main className="main__main">
                <div className="main__content">
                <div className="main__filters">
                    <button
                    id="cuisine-select"
                    style={filters.showCuisine ? {color: '#244cff'} : null}
                    onClick={() => setFilters(prev => ({...prev, showCuisine: !prev.showCuisine}))} 
                    className="main__filters__button">
                        {cuisine} <span style={filters.showCuisine ? {transform: 'rotate(270deg)'} : null} className="main__filters__button__arrow">&lt;</span>
                    </button>

                    <button 
                    id="healthy-filter"
                    onClick={() => setFilters(prev => ({...prev, healthy: !prev.healthy}))} 
                    className={`main__filters__button ${filters.healthy ? 'active' : ''}`}>
                        Здоровое питание
                    </button>

                    <button 
                    id="vegetarian-filter"
                    onClick={() => setFilters(prev => ({...prev, vegetarian: !prev.vegetarian}))} 
                    className={`main__filters__button ${filters.vegetarian ? 'active' : ''}`}>
                        Вегетарианское 
                    </button>

                    <button onClick={() => setMobileFilters(prev => !prev)} id="filters-mobile" className="main__filters__button">
                        Фильтры <span style={mobileFilters ? {transform: 'rotate(90deg)'} : {transform: 'rotate(270deg)'}} className="main__filters__button__arrow">&lt;</span>
                    </button>

                    <a href="#information" id="saved" className="main__filters__button">Сохранённые</a>

                    <div className={`main__filters__cuisine ${filters.showCuisine ? 'show-cuisine' : ''}`}>
                        <button style={{borderTopLeftRadius: '5px'}} onClick={() => chooseCuisine('Русская')} className="main__filters__cuisine__button">Русская</button>
                        <button style={{borderTopRightRadius: '5px'}} onClick={() => chooseCuisine('Греческая')}  className="main__filters__cuisine__button">Греческая</button>
                        <button onClick={() => chooseCuisine('Итальянская')}  className="main__filters__cuisine__button">Итальянская</button>
                        <button onClick={() => chooseCuisine('Американская')}  className="main__filters__cuisine__button">Американская</button>
                        <button onClick={() => chooseCuisine('Восточно-азиатская')}  className="main__filters__cuisine__button">Восточно-азиатская</button>
                        <button onClick={() => chooseCuisine('Французская')} className="main__filters__cuisine__button">Французская</button>
                        <button onClick={() => chooseCuisine('Ближневосточная')}  className="main__filters__cuisine__button">Ближневосточная</button>
                        <button onClick={() => chooseCuisine('Мексиканская')}  className="main__filters__cuisine__button">Мексиканская</button>
                        <button style={{borderBottomLeftRadius: '5px'}} onClick={() => chooseCuisine('Другое')}  className="main__filters__cuisine__button">Другое</button>
                        <button style={{borderBottomRightRadius: '5px'}} onClick={() => chooseCuisine('Кухня')}  className="main__filters__cuisine__button">Любая</button>
                    </div>

                    <div className={`main__filters__mobile ${mobileFilters ? 'show-mobile-filters' : ''}`}>
                    <button
                    style={filters.showCuisine ? {color: '#244cff'} : null}
                    onClick={() => setFilters(prev => ({...prev, showCuisine: !prev.showCuisine}))} 
                    className="main__filters__button">
                        {cuisine} <span style={filters.showCuisine ? {transform: 'rotate(90deg)'} :  {transform: 'rotate(270deg)'}} className="main__filters__button__arrow">&lt;</span>
                    </button>

                    <button 
                    onClick={() => setFilters(prev => ({...prev, healthy: !prev.healthy}))} 
                    className={`main__filters__button ${filters.healthy ? 'active' : ''}`}>
                        Здоровое питание
                    </button>

                    <button 
                    onClick={() => setFilters(prev => ({...prev, vegetarian: !prev.vegetarian}))} 
                    className={`main__filters__button ${filters.vegetarian ? 'active' : ''}`}>
                        Вегетарианское 
                    </button>
                    </div>
                </div>
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
                    {!loading ? memoizedCards : <Loader />}

                </div>
            </div>
            </div>
                <aside id="information" className="main__info">
                <div className="main__info__profile">
                    <p className="main__info__greetings">{auth.currentUser ? `Добро пожаловать, ${userdata.name}!` : 'Вы не вошли в аккаунт :('}</p>
                </div>
                {auth.currentUser ? 
                <div className="main__info__saved">
                    <div className="main__info__saved__header">
                        <p className="main__info__title">Сохранённые блюда:</p>
                        <button id="wipe" onClick={wipe} className="main__swipe-button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 5a1 1 0 0 1-1 1H3a1 1 0 0 1 0-2h5V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1h5a1 1 0 0 1 1 1zM4.934 21.071 4 8h16l-.934 13.071a1 1 0 0 1-1 .929H5.931a1 1 0 0 1-.997-.929zM15 18a1 1 0 0 0 2 0v-6a1 1 0 0 0-2 0zm-4 0a1 1 0 0 0 2 0v-6a1 1 0 0 0-2 0zm-4 0a1 1 0 0 0 2 0v-6a1 1 0 0 0-2 0z"/></svg></button>
                    </div>
                    {favorites.map((item, index) => 
                    <div id={item.id} style={{backgroundImage: `url(${item.data.image})`}} key={item.data.id} onClick={() => showSavedRecipe(index)} className="main__info__favorite">
                        <p className="main__info__favorite__title">{item.data.title}</p>
                        {/* <img className="main__info__favorite__image" src={item.data.image} alt="" /> */}
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
            </main>
        </section>
        <Modal button={!alreadySaved ? <button onClick={() => addToFavorites(true)} title="Добавить в избранное" id="add" className="main__swipe-button">
                    <svg id="addToFavoriteModal" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25"><path d="m18.25 15.52 1.36 7.92-7.11-3.74-7.11 3.74 1.36-7.92L1 9.92l7.95-1.16 3.55-7.2 3.55 7.2L24 9.92z"/></svg>
                </button> : <button id="deleteRecipe" onClick={() => deleteRecipe(recipe.index)} className="main__swipe-button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 5a1 1 0 0 1-1 1H3a1 1 0 0 1 0-2h5V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1h5a1 1 0 0 1 1 1zM4.934 21.071 4 8h16l-.934 13.071a1 1 0 0 1-1 .929H5.931a1 1 0 0 1-.997-.929zM15 18a1 1 0 0 0 2 0v-6a1 1 0 0 0-2 0zm-4 0a1 1 0 0 0 2 0v-6a1 1 0 0 0-2 0zm-4 0a1 1 0 0 0 2 0v-6a1 1 0 0 0-2 0z"/></svg></button>}>
            <div className="recipe-modal">
                <div className="recipe-modal__title">{recipe.title}                 
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