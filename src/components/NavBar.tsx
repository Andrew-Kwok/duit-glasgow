"use client";

import {useContext} from "react";
import {ThemeContext} from "@component/context/ThemeContext";
import Link from "next/link";
import { signOut } from 'next-auth/react';

export default function NavBar() {
    const { theme, changeTheme } = useContext(ThemeContext);

    const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedTheme = event.target.value;
        changeTheme(selectedTheme);
    };

    return (
        <div className="navbar bg-base-300">
            <div className="flex-1">
                <a href="/" className="btn btn-ghost text-xl">Ingfo Koko Glasgow</a>
            </div>

            <div className="flex-none gap-1 mr-2">
                <Link className="btn btn-ghost hidden sm:flex" href={"/dashboard"}> Dashboard </Link>
                <Link className="btn btn-ghost hidden sm:flex" href={"/purchase"}> Purchase </Link>
                <Link className="btn btn-ghost hidden sm:flex" href={"/payment"}> Payment </Link>

                <div className="dropdown">
                    <ul className="menu menu-horizontal px-1">
                        <li>
                            <details>
                                <summary className="text-base-content">Theme</summary>
                                <ul className="dropdown-content bg-base-100 rounded-t-none z-[1] p-2 shadow-2xl">
                                    {['light', 'dark', 'valentine'].map((themeOption) => (
                                        <li key={themeOption}>
                                            <input
                                                type="radio"
                                                name="theme-dropdown"
                                                className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                                                aria-label={themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                                                value={themeOption}
                                                onChange={handleThemeChange}
                                                checked={theme === themeOption}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        </li>
                    </ul>
                </div>

                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-10 rounded-full">
                            <img
                                alt="Glasgow Profile Picture"
                                src="/glasgow-w2024.JPG" />
                        </div>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">

                        <li>
                            <Link className="flex sm:hidden" href={"/dashboard"}> Dashboard </Link>
                        </li>
                        <li>
                            <Link className="flex sm:hidden" href={"/purchase"}> Purchase </Link>
                        </li>
                        <li>
                            <Link className="flex sm:hidden" href={"/payment"}> Payment </Link>
                        </li>

                        {/*<li>*/}
                        {/*    <a className="justify-between">*/}
                        {/*        Profile*/}
                        {/*        <span className="badge">New</span>*/}
                        {/*    </a>*/}
                        {/*</li>*/}
                        {/*<li><a>Settings</a></li>*/}
                        <li><a onClick={() => signOut({ redirectTo: "/" })}>Sign Out</a></li>
                    </ul>
                </div>
            </div>
        </div>
    )
};