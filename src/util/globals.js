import firebase from 'firebase/app'
import { firebaseConfig } from '../config'
import 'firebase/firestore'
import 'firebase/auth'

firebase.initializeApp(firebaseConfig)

const firestore = firebase.firestore()
const videoCache = []

export { firebase, firestore, videoCache }
