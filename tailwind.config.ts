module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}", // adjust if your files live elsewhere
        "./node_modules/flowbite-react/**/*.{js,ts,jsx,tsx}"
    ],
    plugins: [
        require('flowbite/plugin')
    ],
};
