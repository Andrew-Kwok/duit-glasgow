import {useContext} from "react";
import {ThemeContext} from "@component/context/ThemeContext";

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

            <div className="flex-none dropdown">
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
        </div>
    )
};