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
"server": "node server/server.cjs",
"start": "concurrently \"npm run dev\" \"npm run server\""
```

`npm start`로 프론트엔드와 인증 라우터가 포함된 API 서버를 함께 실행합니다.
`.env`에는 `VITE_API_BASE_URL=http://localhost:4000/api`, `PORT=4000`,
`JWT_SECRET`을 설정합니다. 데이터는 루트의 `db.json`을 사용합니다.

- 회원가입: `POST /api/auth/signup` (`id`, `nickname`, `email`, `password`)
- 로그인: `POST /api/auth/login` (`id`, `password`)
- 레시피 목록: `GET /api/recipes?_page=1&_limit=8`

redux

```bash
npm install @reduxjs/toolkit react-redux
```
