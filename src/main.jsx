import ReactDOM from 'react-dom/client'
import './styles/index.scss'
import App from './App.jsx'
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDERFstsqpX-2RltaIbJO8nS_PS_aRDG5U",
  authDomain: "food-tinder-7fbe1.firebaseapp.com",
  projectId: "food-tinder-7fbe1",
  storageBucket: "food-tinder-7fbe1.firebasestorage.app",
  messagingSenderId: "844792884623",
  appId: "1:844792884623:web:c70d4df77bd2b4c3a72ffa",
  measurementId: "G-W2HFR2N27Y"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app)

export const database = getFirestore(app)

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <App />
)
