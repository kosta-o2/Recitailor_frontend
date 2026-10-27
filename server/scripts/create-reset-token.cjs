const path = require("node:path");
const fs = require("node:fs");
const dotenv = require("dotenv");

dotenv.config({
  path: path.join(__dirname, "../../.env"),
});

const { createPasswordResetToken } = require("../routes/auth.cjs");

function main() {
  if (!process.env.JWT_SECRET) {
    throw new Error(".env에 JWT_SECRET을 설정해주세요.");
  }

  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    throw new Error("사용법: npm run reset-token -- test@example.com");
  }

  const dbPath = path.join(__dirname, "../../db.json");
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

  if (!Array.isArray(db.members)) {
    throw new Error('db.json에 "members": []가 필요합니다.');
  }

  const member = db.members.find((item) => item.email === email);

  if (!member) {
    throw new Error("가입된 회원을 찾을 수 없습니다.");
  }

  const token = createPasswordResetToken(member);

  console.log(token);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
