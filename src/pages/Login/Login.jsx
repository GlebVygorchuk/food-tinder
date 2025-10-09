import { useState } from "react"
import { signInWithEmailAndPassword, getAuth, sendEmailVerification, setPersistence, browserLocalPersistence } from "firebase/auth"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { sendPasswordResetEmail } from "firebase/auth"
import RepeatEmail from "../../components/RepeatEmail"

export default function Login() {
    const [remember, setRemember] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [visible, setVisible] = useState(false)

    const auth = getAuth()
    const navigate = useNavigate()

    function resetInput(e) {
        e.target.classList.remove('error')
    }

    function handleLogin(e) {
        e.preventDefault()
        if (remember) {
            setPersistence(auth, browserLocalPersistence)
        }
        signInWithEmailAndPassword(auth, email, password)
        .then(() => navigate('/'))
        .then(() => toast.success('Вы вошли в систему!'))
        .catch(() => {
            const inputs = document.querySelectorAll('.form__input')
            inputs.forEach(input => input.classList.add('error'))
            toast.error('Данные введены неверно!')
        })
    }

    return (
        <section className="login">
            <div style={{marginTop: '90px'}} className="form-wrapper">
                <div className="form-header">Вход</div>
                <form className="form">

                    <div className="form__input-wrapper">
                        <input onFocus={resetInput} onInput={(e) => setEmail(e.target.value)} value={email} className="form__input" />
                        <p className="form__placeholder">E-Mail</p>
                    </div>

                    <div className="form__input-wrapper">
                        <input onFocus={resetInput} type={visible ? 'text' : 'password'} onInput={(e) => setPassword(e.target.value)} value={password} className="form__input" />
                        <p className="form__placeholder">Пароль</p>
                        {visible 
                        ? <svg className='form__eye' onClick={() => setVisible(prev => !prev)} xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M21.83 11.442C21.653 11.179 17.441 5 12 5s-9.653 6.179-9.83 6.442L1.8 12l.374.558C2.347 12.821 6.559 19 12 19s9.653-6.179 9.83-6.442L22.2 12zM12 17c-3.531 0-6.664-3.59-7.758-5C5.336 10.59 8.469 7 12 7s6.664 3.59 7.758 5c-1.094 1.41-4.227 5-7.758 5z"/><path d="M12 8a4 4 0 1 0 4 4 4 4 0 0 0-4-4zm0 6a2 2 0 1 1 2-2 2 2 0 0 1-2 2z"/></svg>
                        : <svg className='form__eye' onClick={() => setVisible(prev => !prev)} xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M21.83 11.442A19.711 19.711 0 0 0 18.018 7.4l3.689-3.689-1.414-1.418-3.966 3.966A8.774 8.774 0 0 0 12 5c-5.441 0-9.653 6.179-9.83 6.442L1.8 12l.374.558A19.711 19.711 0 0 0 5.982 16.6l-3.689 3.693 1.414 1.414 3.966-3.966A8.774 8.774 0 0 0 12 19c5.441 0 9.653-6.179 9.83-6.442L22.2 12zM4.242 12C5.336 10.59 8.469 7 12 7a6.47 6.47 0 0 1 2.853.733l-.834.834A3.947 3.947 0 0 0 12 8a4 4 0 0 0-4 4 3.947 3.947 0 0 0 .567 2.019l-1.16 1.16A17.993 17.993 0 0 1 4.242 12zM14 12a2 2 0 0 1-2 2 1.96 1.96 0 0 1-.511-.075l2.436-2.436A1.96 1.96 0 0 1 14 12zm-4 0a2 2 0 0 1 2-2 1.96 1.96 0 0 1 .511.075l-2.436 2.436A1.96 1.96 0 0 1 10 12zm2 5a6.47 6.47 0 0 1-2.853-.733l.834-.834A3.947 3.947 0 0 0 12 16a4 4 0 0 0 4-4 3.947 3.947 0 0 0-.567-2.019l1.16-1.16A17.993 17.993 0 0 1 19.758 12c-1.094 1.41-4.227 5-7.758 5z"/></svg>}
                    </div>

                    <div onClick={() => setRemember(prev => !prev)} className="form__remember">
                        <div className={`form__remember__checkbox ${remember ? 'checkbox-active' : ''}`}>
                            <svg width="30" height="30" viewBox="0 0 16 16">
                                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
                            </svg>
                        </div>
                        <span className="form__remember__text">Запомнить меня</span>
                    </div>

                    <button onClick={handleLogin} className="form__button">Войти</button>

                    <div className="extra">
                        <RepeatEmail
                        defaultMessage={'Забыли пароль?'} 
                        timerStartPoint={60}
                        toastMessage={'На вашу почту отправлено письмо для сброса пароля'}
                        action={sendPasswordResetEmail(auth, email)}/>
                    </div>
                </form>
            </div>
        </section>
    )
}