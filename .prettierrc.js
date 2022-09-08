module.exports={
  "printWidth": 80,
  "singleQuote": true,
  "trailingComma": "all",
  "proseWrap": "never",
  "overrides": [{ "files": ".prettierrc", "options": { "parser": "json" } }],
  "plugins":["./node_modules/prettier-plugin-organize-imports","./node_modules/prettier-plugin-packagejson"]
}
