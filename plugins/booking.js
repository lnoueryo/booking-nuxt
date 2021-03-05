import firebase from "firebase/app"
import 'firebase/firestore'
if (!firebase.apps.length) {
    firebase.initializeApp({
        apiKey: "AIzaSyBVw9bJ5fMFyfEZPXxgUVN14tpJsUf5kbM",
        authDomain: "booking-88b35.firebaseapp.com",
        projectId: "booking-88b35",
        storageBucket: "booking-88b35.appspot.com",
        messagingSenderId: "985889831154",
        appId: "1:985889831154:web:b5f666e53ff08db80f786b",
        measurementId: "G-KSCMQJGG14"
    })
}

export default firebase
