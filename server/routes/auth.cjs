const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createHmac } = require("node:crypto");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isValidEmail(value) {
  return Array.from(value).length <= 50 && EMAIL_PATTERN.test(value);
}

function isValidPassword(value) {
  return (
    typeof value === "string" &&
    value.length >= 8 &&
    Buffer.byteLength(value, "utf8") <= 72
  );
}

function isActiveMember(member) {
  return Boolean(member && member.status === 1 && member.deleted_at === null);
}

// 응답에서 비밀번호를 제외합니다.
function publicMember(member) {
  return {
    id: member.id,
    nickname: member.nickname,
    email: member.email,
  };
}

// 비밀번호 변경 시 이전 재설정 토큰을 무효화하기 위한 검증값
function passwordProof(member) {
  return createHmac("sha256", process.env.JWT_SECRET)
    .update(JSON.stringify(["password-reset", member.id, member.password]))
    .digest("hex");
}

// 본인 확인 이후 서버 내부에서만 호출합니다.
function createPasswordResetToken(member) {
  if (!isActiveMember(member)) {
    throw new Error("활성 회원만 비밀번호를 재설정할 수 있습니다.");
  }

  return jwt.sign(
    {
      passwordProof: passwordProof(member),
    },
    process.env.JWT_SECRET,
    {
      subject: member.id,
      audience: "password-reset",
      expiresIn: "15m",
      algorithm: "HS256",
    },
  );
}

function createAuthRouter(db) {
  const router = express.Router();

  // 회원가입
  // POST /api/auth/signup
  router.post("/signup", (req, res) => {
    const id = typeof req.body.id === "string" ? req.body.id.trim() : "";

    const nickname =
      typeof req.body.nickname === "string" ? req.body.nickname.trim() : "";

    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!id || Array.from(id).length > 30) {
      return res.status(400).json({
        message: "아이디는 1자 이상 30자 이하여야 합니다.",
      });
    }

    if (!nickname || Array.from(nickname).length > 30) {
      return res.status(400).json({
        message: "닉네임은 1자 이상 30자 이하여야 합니다.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "50자 이내의 올바른 이메일을 입력해주세요.",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: "비밀번호는 8자 이상, UTF-8 기준 72바이트 이하여야 합니다.",
      });
    }

    const existingId = db.get("members").find({ id }).value();

    if (existingId) {
      return res.status(409).json({
        message: "이미 사용 중인 아이디입니다.",
      });
    }

    const existingEmail = db.get("members").find({ email }).value();

    if (existingEmail) {
      return res.status(409).json({
        message: "이미 가입된 이메일입니다.",
      });
    }

    const now = new Date().toISOString();

    const member = {
      id,
      password: bcrypt.hashSync(password, 12),
      nickname,
      email,
      status: 1,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    db.get("members").push(member).write();

    return res.status(201).json({
      message: "회원가입이 완료되었습니다.",
      member: publicMember(member),
    });
  });

  // 일반 로그인: 아이디 + 비밀번호
  // POST /api/auth/login
  router.post("/login", (req, res) => {
    const id = typeof req.body.id === "string" ? req.body.id.trim() : "";
    const { password } = req.body;

    if (!id || Array.from(id).length > 30 || !isValidPassword(password)) {
      return res.status(400).json({
        message: "아이디와 비밀번호를 확인해주세요.",
      });
    }

    const member = db.get("members").find({ id }).value();

    if (
      !isActiveMember(member) ||
      !bcrypt.compareSync(password, member.password)
    ) {
      return res.status(401).json({
        message: "로그인 정보를 확인해주세요.",
      });
    }

    const accessToken = jwt.sign({}, process.env.JWT_SECRET, {
      subject: member.id,
      audience: "access",
      expiresIn: "1h",
      algorithm: "HS256",
    });

    return res.status(200).json({
      message: "로그인되었습니다.",
      accessToken,
      member: publicMember(member),
    });
  });

  // 비밀번호 재설정
  // POST /api/auth/password-reset/confirm
  router.post("/password-reset/confirm", (req, res) => {
    const { token, newPassword } = req.body;

    if (typeof token !== "string" || !token) {
      return res.status(400).json({
        message: "재설정 토큰을 입력해주세요.",
      });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        message: "비밀번호는 8자 이상, UTF-8 기준 72바이트 이하여야 합니다.",
      });
    }

    let payload;

    try {
      payload = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ["HS256"],
        audience: "password-reset",
      });
    } catch {
      return res.status(400).json({
        message: "재설정 토큰이 유효하지 않거나 만료되었습니다.",
      });
    }

    if (
      !payload ||
      typeof payload !== "object" ||
      typeof payload.sub !== "string" ||
      typeof payload.passwordProof !== "string"
    ) {
      return res.status(400).json({
        message: "올바르지 않은 재설정 토큰입니다.",
      });
    }

    const member = db.get("members").find({ id: payload.sub }).value();

    if (
      !isActiveMember(member) ||
      payload.passwordProof !== passwordProof(member)
    ) {
      return res.status(400).json({
        message: "사용할 수 없는 재설정 토큰입니다.",
      });
    }

    db.get("members")
      .find({ id: member.id })
      .assign({
        password: bcrypt.hashSync(newPassword, 12),
        updated_at: new Date().toISOString(),
      })
      .write();

    return res.status(200).json({
      message: "비밀번호가 변경되었습니다. 다시 로그인해주세요.",
    });
  });

  return router;
}

module.exports = {
  createAuthRouter,
  createPasswordResetToken,
};
