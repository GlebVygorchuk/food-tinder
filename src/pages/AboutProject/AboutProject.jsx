export default function AboutProject() {
    return (
        <section className="about">
            <h1 className="about__title">О проекте</h1>
            <ul className="about__info">
                <li id="mainInfo" className="about__block"> 
                    <p><span>foodHunter</span>- "тиндер-подобное" приложение для поиска аппетитных блюд и рецептов!</p>
                    <p><span>Возможности:</span> Просмотр рецептов, добавление в избранное, филтрация по типам кухни, вегетарианской и здоровой пище</p> 
                    <p><span>Стэк:</span> React, SCSS, Vite, Vercel, Firebase, MockAPI, react-tinder-cards, react-toastify</p>
                    </li>
                <div className="about__contacts">
                <li className="about__block">
                    <p style={{fontSize: '35px', fontWeight: '600'}}>Разработчик: Глеб Выгорчук</p>
                    <p>Связь: TG - @vygorous</p>
                    <p style={{marginTop: '120px'}}>MIT License © 2025 GlebVygorchuk</p>
                </li>
                <li className="about__block">
                    <p style={{fontSize: '35px', fontWeight: '600'}}>Автор идеи: Тома Штыкова</p>
                    <p>Связь: TG - @creepjop</p>
                </li>
                </div>
            </ul>
        </section>
    )
}