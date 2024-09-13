interface CustomCheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export default function CustomCheckbox({ checked, onChange }: CustomCheckboxProps) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`p-0.5 rounded border ${checked ? 'bg-red-500 border-none' : 'border-primary bg-none'}`}
            aria-checked={checked}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 82.28 94.98"
                className="w-6 h-6"
                fill={checked ? 'yellow' : 'none'}
            >
                <path
                    d="M85,22.9A41.57,41.57,0,0,0,59,3.7h0A42.66,42.66,0,0,0,37.7,4a1.43,1.43,0,0,0-1,1.6,1.51,1.51,0,0,0,1.5,1.2A39.79,39.79,0,0,1,49.5,7.9,38.37,38.37,0,0,1,72.1,23.1c5.1,7.5,6.8,16.1,4.8,24.3a28.38,28.38,0,0,1-7.5,13.3L48.1,40.4,58.2,30.3a3,3,0,0,0,0-4.1l-1.5-1.5a2.88,2.88,0,0,0-3.7-.3c-3.5,2.4-7.5,2.4-11.1,1.7a2.86,2.86,0,0,0-2.6.8L22.8,43.5a3,3,0,0,0,0,4.1l7,7a3,3,0,0,0,4.1,0l5.8-5.8L58.3,68.1a38.82,38.82,0,0,1-24.2,1.7c-1.6-.4-3.1-.9-4.8-1.5-.4-.2-1.2-.5-1.9-.8a2.62,2.62,0,0,0-3.1.7L19.9,73a2,2,0,0,0,.4,3l.9.6L10.7,86.9a6.23,6.23,0,0,0,.8,9.5,6.42,6.42,0,0,0,8.8-1.7l9.1-12.5a44.52,44.52,0,0,0,9.4,3.6A44.4,44.4,0,0,0,49,87a41.87,41.87,0,0,0,21.7-6.1l7.1,7.3a5.7,5.7,0,0,0,8.1.1l1.8-1.8a5.7,5.7,0,0,0-.1-8.1L81,72.2a42.15,42.15,0,0,0,4-49.3Z"
                    transform="translate(-8.87 -2.5)"
                />
            </svg>
        </button>
    );
}
