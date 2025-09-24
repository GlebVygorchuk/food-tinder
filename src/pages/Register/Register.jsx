import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, updateProfile } from 'firebase/auth'
import RepeatEmail from '../../components/RepeatEmail'

export default function Register() {
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [passwordCheck, setPasswordCheck] = useState('')
    const [visible, setVisible] = useState({
        password: false,
        check: false
    })
    const [conditions, setConditions] = useState({
        symbolsAmount: false,
        specialSymbols: false,
        lettersIncluded: false,
        numbersIncluded: false
    })
    const [adviceActive, setAdviceActive] = useState(false)
    const [validated, setValidated] = useState(false)
    const [info, setInfo] = useState(false)

    const navigate = useNavigate()

    const auth = getAuth()

    function togglePassword(input) {
        setVisible(prev => ({
            ...prev,
            [input]: !prev[input]
        }))
    }

    function validatePassword(password) {
        function checkCondition(condition, field) {
            if (condition) {
                setConditions(prev => ({
                    ...prev,
                    [field]: true
                }))
            } else {
                setConditions(prev => ({
                    ...prev,
                    [field]: false
                }))
            }
        }

        checkCondition(password.length >= 8 && password.length <= 20, 'symbolsAmount')
        
        const hasSpecialSymbols = /[^a-zA-Zа-яА-ЯёЁ0-9]/
        checkCondition(hasSpecialSymbols.test(password), 'specialSymbols')

        const hasLetters = /[a-zA-Zа-яА-ЯёЁ]/
        checkCondition(hasLetters.test(password), 'lettersIncluded')

        const hasNumbers = /[0-9]/
        checkCondition(hasNumbers.test(password), 'numbersIncluded')
    }

    function handleSubmit(e) {
        e.preventDefault()
        const emailInput = document.getElementById('emailInput')
        const nameInput = document.getElementById('nameInput')
        const passwordInput = document.getElementById('passwordInput')
        const checkInput = document.getElementById('checkInput')

        const inputs = [emailInput, nameInput, passwordInput, checkInput]

        inputs.forEach(input => {
            if (input.value == 0) {
                input.classList.add('error')
            }
        })

        if (password !== passwordCheck || !validated) {
            passwordInput.classList.add('error')
            checkInput.classList.add('error')
        }

        if (validated && email.length > 0 && name.length > 0 && password === passwordCheck) {
            toast.info('Подтвердите регистрацию на почте')
            createUserWithEmailAndPassword(auth, email, password)
            .then(() => {
                sendEmailVerification(auth.currentUser)
                updateProfile(auth.currentUser, {
                    displayName: name
                })
            })
            .then(() => setInfo(true))
            .catch(error => {
                throw new Error(error.code)
            })
        } else {
            toast.error('Данные заполнены некорректно')
            throw new Error('Something done wrong...')
        }
    }

    function resetInput(e) {
        e.target.classList.remove('error')
    }

    useEffect(() => {
        setValidated(
            conditions.symbolsAmount 
            && conditions.specialSymbols 
            && conditions.lettersIncluded 
            && conditions.numbersIncluded ? true : false
        )
    }, [conditions])

    useEffect(() => {
        const interval = setInterval(() => {
            const user = auth.currentUser

            if (user) {
                user.reload()
                if (user.emailVerified) {
                    setTimeout(() => {
                        navigate('/')
                        .then(() => toast.success('Вы вошли в систему!'))
                    }, 1000)
                }
            }
        }, 3000)

        return () => clearInterval(interval)
    }, [])

    // Костыль, переделать через onAuthStateChanged !!!

    return (
        <section className="register">
            <div className="form-wrapper">
                <div className="form-header">Создайте аккаунт</div>
                <form className="form">

                    <div className="form__input-wrapper">
                        <input
                        onFocus={resetInput}
                        id='emailInput'
                        value={email} 
                        onInput={(e) => setEmail(e.target.value)}
                        type="email" 
                        className="form__input" 
                        />
                        <p className="form__placeholder">E-mail</p>
                    </div>

                    <div className="form__input-wrapper">
                        <input
                        onFocus={resetInput}
                        id='nameInput' 
                        value={name}
                        onInput={(e) => setName(e.target.value)}
                        type="text" 
                        className="form__input" 
                        maxLength={25}
                        />
                        <p className="form__placeholder">Имя</p>
                    </div>

                    <div className="form__input-wrapper">
                        <input
                        id='passwordInput'
                        maxLength={20} 
                        value={password}
                        onInput={(e) => {
                            setPassword(e.target.value)
                            validatePassword(e.target.value)
                        }}
                        onFocus={(e) => {
                            resetInput(e);
                            setAdviceActive(true);
                        }} 
                        onBlur={() => setAdviceActive(false)} 
                        type={visible.password ? 'text' : 'password'} 
                        className="form__input" />
                        <p className="form__placeholder">Пароль</p>
                        <div className={`form__advice ${adviceActive ? 'show' : ''}`}>

                            <div className="form__advice__condition">
                                {conditions.symbolsAmount? <svg className='form__advice__svg' width="25" height="25" fill="black" viewBox="0 0 16 16">
                                    <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
                                </svg> : <svg className='form__advice__svg' width="23" height="23" fill='black' viewBox="0 0 16 16"><path d="m4.12 6.137 1.521-1.52 7 7-1.52 1.52z"/><path d="m4.12 11.61 7.001-7 1.52 1.52-7 7z"/></svg>}
                                <p>8-20 символов</p>
                            </div>

                            <div className="form__advice__condition">
                                {conditions.specialSymbols? <svg className='form__advice__svg' width="25" height="25" fill="black" viewBox="0 0 16 16">
                                    <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
                                </svg> : <svg className='form__advice__svg' width="23" height="23" fill='black' viewBox="0 0 16 16"><path d="m4.12 6.137 1.521-1.52 7 7-1.52 1.52z"/><path d="m4.12 11.61 7.001-7 1.52 1.52-7 7z"/></svg>}
                                <p>Спецсимволы</p>
                            </div>

                            <div className="form__advice__condition">
                                {conditions.lettersIncluded? <svg className='form__advice__svg' width="25" height="25" fill="black" viewBox="0 0 16 16">
                                    <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
                                </svg> : <svg className='form__advice__svg' width="23" height="23" fill='black' viewBox="0 0 16 16"><path d="m4.12 6.137 1.521-1.52 7 7-1.52 1.52z"/><path d="m4.12 11.61 7.001-7 1.52 1.52-7 7z"/></svg>}
                                <p>Буквы</p>
                            </div>

                            <div className="form__advice__condition">
                                {conditions.numbersIncluded? <svg className='form__advice__svg' width="25" height="25" fill="black" viewBox="0 0 16 16">
                                    <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
                                </svg> : <svg className='form__advice__svg' width="23" height="23" fill='black' viewBox="0 0 16 16"><path d="m4.12 6.137 1.521-1.52 7 7-1.52 1.52z"/><path d="m4.12 11.61 7.001-7 1.52 1.52-7 7z"/></svg>}
                                <p>Числа</p>
                            </div>
                           
                        </div>
                        {visible.password 
                        ? <svg className='form__eye' onClick={() => togglePassword('password')} xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M21.83 11.442C21.653 11.179 17.441 5 12 5s-9.653 6.179-9.83 6.442L1.8 12l.374.558C2.347 12.821 6.559 19 12 19s9.653-6.179 9.83-6.442L22.2 12zM12 17c-3.531 0-6.664-3.59-7.758-5C5.336 10.59 8.469 7 12 7s6.664 3.59 7.758 5c-1.094 1.41-4.227 5-7.758 5z"/><path d="M12 8a4 4 0 1 0 4 4 4 4 0 0 0-4-4zm0 6a2 2 0 1 1 2-2 2 2 0 0 1-2 2z"/></svg>
                        : <svg className='form__eye' onClick={() => togglePassword('password')} xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M21.83 11.442A19.711 19.711 0 0 0 18.018 7.4l3.689-3.689-1.414-1.418-3.966 3.966A8.774 8.774 0 0 0 12 5c-5.441 0-9.653 6.179-9.83 6.442L1.8 12l.374.558A19.711 19.711 0 0 0 5.982 16.6l-3.689 3.693 1.414 1.414 3.966-3.966A8.774 8.774 0 0 0 12 19c5.441 0 9.653-6.179 9.83-6.442L22.2 12zM4.242 12C5.336 10.59 8.469 7 12 7a6.47 6.47 0 0 1 2.853.733l-.834.834A3.947 3.947 0 0 0 12 8a4 4 0 0 0-4 4 3.947 3.947 0 0 0 .567 2.019l-1.16 1.16A17.993 17.993 0 0 1 4.242 12zM14 12a2 2 0 0 1-2 2 1.96 1.96 0 0 1-.511-.075l2.436-2.436A1.96 1.96 0 0 1 14 12zm-4 0a2 2 0 0 1 2-2 1.96 1.96 0 0 1 .511.075l-2.436 2.436A1.96 1.96 0 0 1 10 12zm2 5a6.47 6.47 0 0 1-2.853-.733l.834-.834A3.947 3.947 0 0 0 12 16a4 4 0 0 0 4-4 3.947 3.947 0 0 0-.567-2.019l1.16-1.16A17.993 17.993 0 0 1 19.758 12c-1.094 1.41-4.227 5-7.758 5z"/></svg>}
                    </div>

                    <div className="form__input-wrapper">
                        <input
                        onFocus={resetInput}
                        id='checkInput'
                        maxLength={20} 
                        value={passwordCheck}
                        onInput={(e) => setPasswordCheck(e.target.value)}
                        type={visible.check ? 'text' : 'password'} 
                        className="form__input" />
                        <p className="form__placeholder">Подтвердить пароль</p>
                        {visible.check
                        ? <svg className='form__eye' onClick={() => togglePassword('check')} xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M21.83 11.442C21.653 11.179 17.441 5 12 5s-9.653 6.179-9.83 6.442L1.8 12l.374.558C2.347 12.821 6.559 19 12 19s9.653-6.179 9.83-6.442L22.2 12zM12 17c-3.531 0-6.664-3.59-7.758-5C5.336 10.59 8.469 7 12 7s6.664 3.59 7.758 5c-1.094 1.41-4.227 5-7.758 5z"/><path d="M12 8a4 4 0 1 0 4 4 4 4 0 0 0-4-4zm0 6a2 2 0 1 1 2-2 2 2 0 0 1-2 2z"/></svg>
                        : <svg className='form__eye' onClick={() => togglePassword('check')} xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M21.83 11.442A19.711 19.711 0 0 0 18.018 7.4l3.689-3.689-1.414-1.418-3.966 3.966A8.774 8.774 0 0 0 12 5c-5.441 0-9.653 6.179-9.83 6.442L1.8 12l.374.558A19.711 19.711 0 0 0 5.982 16.6l-3.689 3.693 1.414 1.414 3.966-3.966A8.774 8.774 0 0 0 12 19c5.441 0 9.653-6.179 9.83-6.442L22.2 12zM4.242 12C5.336 10.59 8.469 7 12 7a6.47 6.47 0 0 1 2.853.733l-.834.834A3.947 3.947 0 0 0 12 8a4 4 0 0 0-4 4 3.947 3.947 0 0 0 .567 2.019l-1.16 1.16A17.993 17.993 0 0 1 4.242 12zM14 12a2 2 0 0 1-2 2 1.96 1.96 0 0 1-.511-.075l2.436-2.436A1.96 1.96 0 0 1 14 12zm-4 0a2 2 0 0 1 2-2 1.96 1.96 0 0 1 .511.075l-2.436 2.436A1.96 1.96 0 0 1 10 12zm2 5a6.47 6.47 0 0 1-2.853-.733l.834-.834A3.947 3.947 0 0 0 12 16a4 4 0 0 0 4-4 3.947 3.947 0 0 0-.567-2.019l1.16-1.16A17.993 17.993 0 0 1 19.758 12c-1.094 1.41-4.227 5-7.758 5z"/></svg>}
                    </div>

                    <button
                    onClick={handleSubmit} 
                    className="form__button">
                        Зарегистрироваться
                    </button>

                    <p className="register__already-registered">Уже есть аккаунт? <Link to='/login'><span className='register__log-in'>Войти</span></Link></p>

                    {info ?
                    <div className="extra">
                        <RepeatEmail 
                        defaultMessage={'Отправить снова'}
                        timerStartPoint={30}
                        toastMessage={'Письмо с подтверждением отправлено повторно'}
                        action={sendEmailVerification(auth.currentUser)} />
                    </div>
                     : null}

                </form>
            </div>
        </section>
    )
}