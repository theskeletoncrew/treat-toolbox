import "../styles/globals.css";

import type { AppProps } from "next/app";
import { auth } from "../app-firebase";
import { signInAnonymously, signInWithRedirect, getRedirectResult, GoogleAuthProvider } from "firebase/auth";
import { useEffect } from "react";
import { useCookies } from "react-cookie";

export default function App({ Component, pageProps }: AppProps) {
  const [cookie, setCookie] = useCookies(["token"]);

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      if (user) {
        user.getIdToken().then((token) => {
          setCookie("token", token, {
            path: "/",
            maxAge: 3600,
            sameSite: true,
          });
        });
      } else {
        const provider = new GoogleAuthProvider();

        signInWithRedirect(auth, provider);

        getRedirectResult(auth).then((result) => {
          if (result) {
            // This gives you a Google Access Token. You can use it to access Google APIs.
            const credential = GoogleAuthProvider.credentialFromResult(result);

            if (credential) {
              const token = credential.accessToken;

              // The signed-in user info.
              const user = result.user;
            }
          }
        }).catch((error) => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          // The email of the user's account used.
          const email = error.email;
          // The AuthCredential type that was used.
          const credential = GoogleAuthProvider.credentialFromError(error);
          // ...
        });

        // signInAnonymously(auth).catch(function (error) {
        //   console.log(error);
        // });
      }
    });
  });

  return <Component {...pageProps} />;
}
