import '@component/styles/globals.css'
import type {AppProps} from 'next/app'
import {ThemeProvider} from "@component/context/ThemeContext";
import NavBar from "@component/components/NavBar";
import React from "react";
import {PersonProvider} from "@component/context/PersonContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
        <PersonProvider>
            <NavBar />
            <Component {...pageProps} />
        </PersonProvider>
    </ThemeProvider>
  )
}
