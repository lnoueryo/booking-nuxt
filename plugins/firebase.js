import firebase from "firebase/app"
import 'firebase/firestore'
if (!firebase.apps.length) {
    firebase.initializeApp({
        apiKey: "AIzaSyCucDC37O46VDAPnM6tagCmTE7R6lfE4HE",
        authDomain: "reservierung-6329e.firebaseapp.com",
        projectId: "reservierung-6329e",
        storageBucket: "reservierung-6329e.appspot.com",
        messagingSenderId: "199184154017",
        appId: "1:199184154017:web:558f30e04bcf428a121fe0",
        measurementId: "G-W3TEQLVPH5"
    })
}

export default firebase
