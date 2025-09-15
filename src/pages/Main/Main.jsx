import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

export default function Main() {
    const [userdata, setUserdata] = useState({
        name: '',
        email: ''
    })
    const [dishes, setDishes] = useState([])

    const auth = getAuth()
    const navigate = useNavigate()

    async function fetchRecipes() {
        const apiKey = 'ca397846249d4d9bb87fb1872de0c844'
        const url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&number=10&addRecipeInformation=true`

        const response = await fetch(url)
        const result = await response.json()

        setDishes(result.results)
    }

    useEffect(() => {
        fetchRecipes()
    }, [])

    useEffect(() => {
        console.log(dishes)
    }, [dishes])

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

    function leave() {
        signOut(auth)
        .then(() => {
            navigate('/register')
        })
    }

    return (
        <>
        <section className="main">
            <aside className="main__info">
                <div className="main__info__profile">
                    <p className="main__info__greetings">Добро пожаловать, {userdata.name}!</p>
                    <svg onClick={() => leave()} fill="#969696" width='35' data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M10.95 15.84h-11V.17h11v3.88h-1V1.17h-9v13.67h9v-2.83h1v3.83z"/><path d="M5 8h6v1H5zM11 5.96l4.4 2.54-4.4 2.54V5.96z"/></svg>
                </div>
                <div className="main__info__saved">
                    <p className="main__info__title">Сохранённые блюда:</p>
                </div>
            </aside>
            <div className="main__cards-container">
                <div className="main__cards"></div>
            </div>
        </section>
        </>
    )
}