export default function AboutProject() {
    return (
        <section className="about">
            <h1 className="about__title">О проекте</h1>
            <ul className="about__info">
                <li className="about__block"> 
                    <p><span>🚀foodHunter</span>- "тиндер-подобное" приложение для поиска аппетитных блюд и рецептов!</p>
                    <div><p style={{marginTop: '30px'}}><span style={{fontSize: '30px'}}>✨ Возможности:</span> листание ленты как в Tinder с блюдами, просмотр рецептов, добавление в избранное</p> 
                    </div>
                    </li>
                <li className="about__block">
                    <p><span>🛠 Технологии:</span></p>
                    <ul className="about__list">
                        <li>React</li>
                        <li>react-tinder-cards </li>
                        <li>Firebase</li>
                        <li>SCSS</li>
                        <li>Vite</li>
                        <li>Vercel</li>
                    </ul>
                </li>
                <li style={{height: '300px'}} className="about__block">
                    <p style={{fontSize: '35px', fontWeight: '600'}}>Разработчик: Глеб Выгорчук</p>
                    <p>Связь: TG - @vygorous</p>
                    <p style={{marginTop: '120px'}}>MIT License © 2025 GlebVygorchuk</p>
                </li>
                <li style={{height: '300px'}}  className="about__block">
                    <p style={{fontSize: '35px', fontWeight: '600'}}>Автор идеи: Тома Штыкова</p>
                    <p>Связь: TG - @creepjop</p>
                </li>
            </ul>
        </section>
    )
}