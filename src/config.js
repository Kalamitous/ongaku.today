export const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID
}

export const youtubeConfig = {
    apiKey: process.env.REACT_APP_YOUTUBE_API_KEY,
    clientId: process.env.REACT_APP_YOUTUBE_CLIENT_ID,
    scope: process.env.REACT_APP_YOUTUBE_SCOPE
}
