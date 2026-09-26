module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --cache --fix', 'prettier --cache --write', 'npm run lint:style'],
};
