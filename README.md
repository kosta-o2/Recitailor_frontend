# Recitailor front 작업

axios

```bash
npm i axios
```

json-server

```bash
npm install -D json-server
```

루트에 db.json생성

```bash
npm install -D concurrently
```

package.json

```json
"server": "json-server --watch db.json --port 4000",
"start": "concurrently \"npm run dev\" \"npm run server\""
```

redux

```bash
npm install @reduxjs/toolkit react-redux
```
