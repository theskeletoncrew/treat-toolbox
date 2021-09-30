import "../styles/globals.css";

import type { AppProps } from "next/app";
import { auth } from "../app-firebase";
import { signInAnonymously } from "firebase/auth";
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
        signInAnonymously(auth).catch(function (error) {
          console.log(error);
        });
      }
    });
  });

  return <Component {...pageProps} />;
}
