import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET, SERVER_ROOT_URI, COOKIE_NAME } from "./config.js"
import querystring from "querystring";
import cookieParser from "cookie-parser";

const port = 8000

const app = express()

const redirectURI = "api/sessions/oauth/google"

app.use(cookieParser());
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

function getToken({
    code,
    clientId,
    clientSecret,
    redirectUri,
}: {
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
}) : Promise<{
    access_token: string;
    expires_in: Number;
    refresh_token: string;
    scope: string;
    id_token: string;
}> {
    const url =  "https://oauth2.googleapis.com/token";
    const values = {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
    }
    return axios.post(url, querystring.stringify(values), {
        headers: {
            "Content-type": "application/x-www-form-urlencoded",
        },
    }).then((res) => res.data)
    .catch((error) => {
        console.log("error")
        throw new Error(error.message)
    })
}


// getting the user from google with the code
app.get(`/${redirectURI}`, async (req, res) => {
    const code = req.query.code as string;
    const { id_token, access_token} = await getToken({
        code,
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        redirectUri: `${SERVER_ROOT_URI}/${redirectURI}`
    })
    const googleUser = await axios
    .get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    )
    .then((res) => res.data)
    .catch((error) => {
      console.error(`Failed to fetch user`);
      throw new Error(error.message);
    });
    const token = jwt.sign(googleUser, JWT_SECRET);

    res.cookie(COOKIE_NAME, token, {
        maxAge: 900000,
        httpOnly: true,
        secure: false,
    })

    res.redirect("/")
})
//getting the user

function main() {
    app.listen(port, () => {
        console.log("listening on port 8000")
    })
}

main()