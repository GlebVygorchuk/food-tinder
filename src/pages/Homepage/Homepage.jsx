import { Link } from "react-router-dom"

export default function Homepage() {
    return (
        <section className="homepage">

            <header className="homepage__header">
                <h1 className="homepage__header__title">FoodSeeker</h1>
                <div className="homepage__header__auth-buttons">

                    <Link to='/login'>
                        <button className="homepage__header__auth-buttons__log-in">Вход</button>
                    </Link>
                    
                    <Link to='/register'>
                        <button className="homepage__header__auth-buttons__sign-up">Регистрация</button>
                    </Link>
                    
                </div>
            </header>

            <main className="homepage__main">
                <div className="homepage__main__start">
                    <h1 className="homepage__main__description">Найди своё идеальное блюдо</h1>
                    
                    <Link to='/register'>
                        <button className="homepage__main__start-btn">Начать <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25"><path d="m17.5 5.999-.707.707 5.293 5.293H1v1h21.086l-5.294 5.295.707.707L24 12.499l-6.5-6.5z" data-name="Right"/></svg></button>
                    </Link>
                </div>
                <div className="homepage__main__pictures">
                    <img id="salad" width='175px' className="homepage__main__pictures__picture" src="src/assets/coffee.jpg" alt="" />
                    <img id="pizza" width='175px' className="homepage__main__pictures__picture" src="src/assets/cake.jpg" alt="" />
                    <img id="cruassan" width='175px' className="homepage__main__pictures__picture" src="src/assets/matcha.jpg" alt="" />
                     <img id="cruassan" width='175px' className="homepage__main__pictures__picture" src="src/assets/cruassan.jpg" alt="" />
                </div>
            </main>

        </section>
    )
}