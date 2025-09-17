import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import React, { useEffect, useState, useRef } from "react"
import TinderCard from 'react-tinder-card'

export default function Main() {
    const [userdata, setUserdata] = useState({
        name: '',
        email: ''
    })
    const [dishes, setDishes] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)

    const example = [
        {id: 1, title: 'Pizza'},
        {id: 2, title: 'Dumplings'},
        {id: 3, title: 'Pasta'},
        {id: 4, title: 'Greek salad'},
        {id: 5, title: 'Gyros'},
        {id: 1, title: 'Burger'},
        {id: 2, title: 'Soup'},
        {id: 3, title: 'Porridge'},
        {id: 4, title: 'Sushi'},
        {id: 5, title: 'Onigiri'}
    ]

    const auth = getAuth()
    const navigate = useNavigate()
    const cardRefs = useRef([])

    cardRefs.current = example.map(() => React.createRef())

    function handleSwipe(direction, swiped) {
        console.log(`${swiped} смахнули в направлении: ${direction}`)
    }

    function handleLeftScreen(name) {
        console.log(`${name} улетела за экран`)
    }

    function swipe(direction, index) {
        setCurrentIndex(prev => prev - 1)

        console.log(index)

        if (cardRefs.current[index] && cardRefs.current[index].current) {
            cardRefs.current[index].current.swipe(direction)
        }
    }

    async function fetchRecipes() {
        const apiKey = 'ca397846249d4d9bb87fb1872de0c844'
        const url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&number=10&addRecipeInformation=true`

        const response = await fetch(url)
        const result = await response.json()

       // setDishes(result.results)
       setDishes(example)
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
        console.log(currentIndex)
    }, [currentIndex])

    useEffect(() => {
        console.log(cardRefs.current)
    }, [cardRefs])

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
                    <svg onClick={() => leave()} fill="#969696" width='35' data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M10.95 15.84h-11V.17h11v3.88h-1V1.17h-9v13.67h9v-2.83h1v3.83z"/><path d="M5 8h6v1H5zM11 5.96l4.4 2.54-4.4 2.54V5.96z"/></svg>
                </div>
                <div className="main__info__saved">
                    {auth.currentUser ? 
                    <p className="main__info__title">Сохранённые блюда:</p> :
                    <div className="unauthorized">
                        Чтобы сохранять рецепты, войдите в аккаунт =&gt;
                        <button onClick={() => navigate('/register')} style={{marginTop: '5px'}} className="unauthorized__button">Регистрация</button>
                        <button onClick={() => navigate('/login')} className="unauthorized__button">Войти</button>
                    </div>
                    }
                </div>
            </aside>
            <div className="main__cards-container">
                <div className="main__cards">
                    {dishes.map((item, index) => (
                        <TinderCard
                        preventSwipe={['up', 'down']}
                        key={item.id} 
                        className="main__card"
                        onSwipe={handleSwipe}
                        onCardLeftScreen={handleLeftScreen}
                        ref={cardRefs.current[index]}>
                            <h3>{item.title}</h3>
                        </TinderCard>
                    ))}
                    <div className="main__swipe-buttons">
                        <button onClick={() => swipe('left', currentIndex)} className="main__swipe-button">&#128078;</button>
                        <button onClick={() => swipe('right', currentIndex)} className="main__swipe-button">&#128077;</button>
                    </div>
                </div>

            </div>
        </section>
        </>
    )
}