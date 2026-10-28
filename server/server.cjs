const path = require("node:path");
const dotenv = require("dotenv");
const jsonServer = require("json-server");
const { createAuthRouter } = require("./routes/auth.cjs");
const { createMypageRouter } = require("./routes/mypage.cjs");

// 프로젝트 루트의 .env 읽기
dotenv.config({
  path: path.join(__dirname, "../.env"),
});

if (!process.env.JWT_SECRET) {
  throw new Error(".env에 JWT_SECRET을 설정해주세요.");
}

const server = jsonServer.create();

// 프로젝트 루트의 db.json 연결
const dataRouter = jsonServer.router(path.join(__dirname, "../db.json"));

if (!Array.isArray(dataRouter.db.get("members").value())) {
  throw new Error('db.json에 "members": []를 설정해주세요.');
}

server.use(jsonServer.defaults());

server.use(jsonServer.bodyParser);

// 사용자 정의 인증 API
server.use("/api/auth", createAuthRouter(dataRouter.db));

// 존재하지 않는 인증 경로 처리
server.use("/api/auth", (req, res) => {
  return res.status(404).json({
    message: "존재하지 않는 인증 API입니다.",
  });
});

// 마이페이지 API (로그인 필요)
server.use("/api/mypage", createMypageRouter(dataRouter.db));

// 존재하지 않는 마이페이지 경로 처리
server.use("/api/mypage", (req, res) => {
  return res.status(404).json({
    message: "존재하지 않는 마이페이지 API입니다.",
  });
});

// 회원 데이터의 기본 CRUD 접근 차단
server.use("/api", (req, res, next) => {
  let segments;

  try {
    segments = decodeURIComponent(req.path)
      .toLowerCase()
      .split("/")
      .filter(Boolean);
  } catch {
    return res.status(400).json({
      message: "잘못된 요청 경로입니다.",
    });
  }

  //  전체 DB 조회 및 members 직접 접근 차단
  if (
    segments.length === 0 ||
    segments.includes("db") ||
    segments.includes("members")
  ) {
    return res.status(403).json({
      message: "접근할 수 없는 데이터입니다.",
    });
  }

  // 관계 조회로 회원 정보가 노출되는 것 방지
  const relations = JSON.stringify({
    embed: req.query._embed,
    expand: req.query._expand,
  }).toLowerCase();

  if (relations.includes("member")) {
    return res.status(403).json({
      message: "회원 정보의 관계 조회는 사용할 수 없습니다.",
    });
  }

  next();
});

// 다른 데이터의 JSON Server 기본 CRUD
server.use("/api", dataRouter);

// 등록되지 않은 경로
server.use((req, res) => {
  return res.status(404).json({
    message: "존재하지 않는 API입니다.",
  });
});

// 공통 오류 처리
server.use((error, req, res, next) => {
  console.error(error);

  const status =
    Number.isInteger(error.status) && error.status >= 400 && error.status < 500
      ? error.status
      : 500;

  return res.status(status).json({
    message:
      status === 500
        ? "서버 처리 중 오류가 발생했습니다."
        : "잘못된 요청입니다.",
  });
});

const port = Number(process.env.PORT) || 4000;

server.listen(port, () => {
  console.log(`API 서버: http://localhost:${port}/api`);
});
