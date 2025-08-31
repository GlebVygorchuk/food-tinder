import { Link } from 'react-router-dom'

export default function Register() {
    return (
        <div className="register">
            <div className="register__form-wrapper">
                <div className="register__form-header">Создайте аккаунт</div>
                <form className="register__form">
                    <input placeholder="Ваш E-Mail" type="email" className="register__form__input" />
                    <input placeholder="Придумайте имя" type="text" className="register__form__input" />
                    <input placeholder="Придумайте пароль" type="password" className="register__form__input" />
                    <input placeholder="Повторите пароль" type="password" className="register__form__input" />
                    <button className="register__form__button">Зарегистрироваться</button>
                    <p className="register__already-registered">Уже есть аккаунт? <Link to='/login'>Войти</Link></p>
                </form>
            </div>
        </div>
    )
}