const jwt = require("jsonwebtoken");
const { isActiveMember } = require("../routes/auth.cjs");

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      audience: "access",
    });
  } catch {
    return null;
  }
}

// 로그인 토큰을 검증하고 req.member에 회원을 담는다. 회원은 토큰의 sub로만 정한다.
function createRequireAuth(db) {
  return (req, res, next) => {
    const [scheme, token] = (req.get("Authorization") || "").split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
      return res.status(401).json({
        message: "로그인이 만료되었거나 유효하지 않습니다.",
      });
    }

    const member = db.get("members").find({ id: payload.sub }).value();

    if (!isActiveMember(member)) {
      return res.status(401).json({ message: "사용할 수 없는 계정입니다." });
    }

    req.member = member;
    return next();
  };
}

// 유효한 토큰이 있으면 req.member를 채우고, 없거나 잘못돼도 막지 않고 넘어간다.
function createOptionalAuth(db) {
  return (req, res, next) => {
    const [scheme, token] = (req.get("Authorization") || "").split(" ");
    const payload = scheme === "Bearer" && token ? verifyAccessToken(token) : null;
    const member = payload
      ? db.get("members").find({ id: payload.sub }).value()
      : null;

    if (isActiveMember(member)) req.member = member;

    return next();
  };
}

module.exports = { createRequireAuth, createOptionalAuth };
