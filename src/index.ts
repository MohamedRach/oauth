import express from "express";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SERVER_ROOT_URI } from "./config.js"
import querystring from "querystring";
const port = 8000

const app = express()

const redirectURI = "api/sessions/oauth/google"


function getGoogleAuthURL() {
    const rootURL = "https://accounts.google.com/o/oauth2/v2/auth"
    const options = {
        redirect_uri: `${SERVER_ROOT_URI}/${redirectURI}`,
        client_id: GOOGLE_CLIENT_ID,
        access_type: "offline",
        response_type: "code",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
        ].join(" "),
    }

    return `${rootURL}?${querystring.stringify(options)}`
}
//getting login uri
app.get("/auth/google/url", (req, res) => {
    return res.send(getGoogleAuthURL())
})
app.get('/', (req, res) => {
    return res.send("hello")
})
// getting the user from google with the code

//getting the user

function main() {
    app.listen(port, () => {
        console.log("listening on port 8000")
    })
}

main()