<br />
<p align="center">
  <a href="https://github.com/Kalamitous/ongaku.today">
    <img src="https://i.imgur.com/1RJvusK.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">ongaku.today</h3>

  <p align="center">
    A robust playlist manager for YouTube.
    <br />
    <a href="https://ongaku.today"><strong>Visit the app »</strong></a>
    <br />
    <br />
    <a href="https://github.com/Kalamitous/ongaku.today/issues">Report Bug</a>
    ·
    <a href="https://github.com/Kalamitous/ongaku.today/issues">Request Feature</a>
  </p>
</p>


## Table of Contents

* [About](#about)
  * [Built With](#built-with)
* [Getting Started](#getting-started)
  * [Firebase Setup](#firebase-setup)
  * [Project Setup](#project-setup)
  * [Installing & Running](#installing--running)
* [Contributing](#contributing)
* [License](#license)
* [Acknowledgements](#acknowledgements)


## About

[![ongaku.today Screenshot][product-screenshot]](https://ongaku.today)

**ongaku.today** makes using YouTube as a music streaming platform easier.

With YouTube, videos can only be organized into playlists.
**ongaku.today** takes this one step further and lets you to organize playlists into folders.
This nested structure of folders and playlists not only helps you keep track of videos better, but also plays well with our queueing system.
**ongaku.today** allows you to mix and match individual videos, playlists, or folders to be added to the queue.
You will always have full control over what is playing.

For convenience, **ongaku.today** has integrated YouTube search and playlist importing functionality.
Night mode can be toggled for your preferred viewing experience.
**ongaku.today** is still early in development with many new features being planned.

### Built With

* [React](https://reactjs.org)
* [Redux](https://redux.js.org)
* [Firebase](https://firebase.google.com)
* [YouTube Data API](https://developers.google.com/youtube/v3)


## Getting Started

To get **ongaku.today** running on your local machine, follow these steps. Make sure you have [Node.js](https://nodejs.org) installed.

### Firebase Setup

1. Create a new [Firebase](https://firebase.google.com) project
2. Add a web app by going to your project settings
3. Create a Cloud Firestore database in `Test mode`
4. Enable Google sign-in by going to `Authentication > Sign-in method`
5. Enable [YouTube Data API](https://console.developers.google.com/apis/library/youtube.googleapis.com?q=youtube&id=125bab65-cfb6-4f25-9826-4dcc309bc508)

### Project Setup

1. Clone the repository
```sh
git clone https://github.com/Kalamitous/ongaku.today.git
```
2. Create the following '.env' file at the root of the cloned repository
```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_DATABASE_URL=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=

REACT_APP_YOUTUBE_API_KEY=
REACT_APP_YOUTUBE_CLIENT_ID=
```
3. Fill in the top portion of the `.env` file with the configuration of your Firebase project web app from step 3 of [Firebase Setup](#firebase-setup)
4. Fill in the bottom portion of the `.env` file with the YouTube Data API key and OAuth client ID found in your project's [Credentials page](https://console.developers.google.com/apis/credentials)

### Installing & Running

1. Install dependencies
```sh
npm install
```
2. Run the app
```sh
npm start
```

You should now be able to access the app at [http://localhost:5000](http://localhost:5000)

## Contributing

Contributions to add features or resolve issues are welcome.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/Name`) or issue branch (`git checkout -b issue/Name`)
3. Commit your changes (`git commit -m 'Message'`)
4. Push to the branch (`git push origin feature/Name`)
5. Open a pull request


## License

Distributed under the MIT License. See `LICENSE` for more information.


## Acknowledgements
* [Material UI Icons](https://www.npmjs.com/package/@material-ui/icons)
* [React Router](https://reactrouter.com)
* [React Sortable HOC](https://github.com/clauderic/react-sortable-hoc)
* [Redux Thunk](https://github.com/reduxjs/redux-thunk)


[product-screenshot]: https://i.imgur.com/4gQjpA4.png
