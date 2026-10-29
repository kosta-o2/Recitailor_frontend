const express = require("express");
const bcrypt = require("bcryptjs");
const { isValidPassword } = require("./auth.cjs");
const { createRequireAuth } = require("../middleware/requireAuth.cjs");
const { createFavoriteStore } = require("../lib/favorites.cjs");
const { parseKind, filterByKind } = require("../lib/postTypes.cjs");

const PER_PAGE = 10;
const KIND_ERROR = { message: "kind는 user 또는 ai여야 합니다." };

// 마이페이지 응답용 회원 정보 (비밀번호 제외)
function myMember(member) {
  return {
    id: member.id,
    nickname: member.nickname,
    email: member.email,
    created_at: member.created_at,
  };
}

function parsePage(value) {
  const page = Number.parseInt(value, 10);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

// 목록을 페이지 단위로 자른다. 범위를 벗어난 page는 마지막 페이지로 맞춘다.
function paginate(list, requestedPage) {
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(parsePage(requestedPage), totalPages);
  const start = (page - 1) * PER_PAGE;

  return {
    items: list.slice(start, start + PER_PAGE),
    total,
    page,
    totalPages,
  };
}

function createMypageRouter(db) {
  const router = express.Router();

  function members() {
    return db.get("members");
  }

  function recipes() {
    return db.get("recipes");
  }

  const favorites = createFavoriteStore(db);

  function toCard(recipe) {
    return {
      id: recipe.id,
      title: recipe.title,
      post_type: recipe.post_type ?? "normal",
      create_at: recipe.create_at,
      likes: favorites.count(recipe.id),
    };
  }

  // 모든 마이페이지 API는 로그인 토큰이 필요하다.
  router.use(createRequireAuth(db));

  // 내 정보 조회
  // GET /api/mypage
  router.get("/", (req, res) => {
    const { id } = req.member;

    return res.status(200).json({
      member: myMember(req.member),
      postCount: recipes().filter({ author: id }).size().value(),
      favoriteCount: favorites.countByMember(id),
    });
  });

  // 닉네임 수정
  // PATCH /api/mypage
  router.patch("/", (req, res) => {
    const nickname =
      typeof req.body.nickname === "string" ? req.body.nickname.trim() : "";

    if (!nickname || Array.from(nickname).length > 30) {
      return res.status(400).json({
        message: "닉네임은 1자 이상 30자 이하여야 합니다.",
      });
    }

    const taken = members()
      .find((member) => member.nickname === nickname && member.id !== req.member.id)
      .value();

    if (taken) {
      return res.status(409).json({ message: "이미 사용 중인 닉네임입니다." });
    }

    const updated = members()
      .find({ id: req.member.id })
      .assign({ nickname, updated_at: new Date().toISOString() })
      .write();

    return res.status(200).json({
      message: "회원정보가 수정되었습니다.",
      member: myMember(updated),
    });
  });

  // 비밀번호 변경
  // PATCH /api/mypage/password
  router.patch("/password", (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!isValidPassword(currentPassword)) {
      return res.status(400).json({
        message: "현재 비밀번호를 확인해주세요.",
      });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        message: "비밀번호는 8자 이상, UTF-8 기준 72바이트 이하여야 합니다.",
      });
    }

    if (!bcrypt.compareSync(currentPassword, req.member.password)) {
      return res.status(401).json({
        message: "현재 비밀번호가 일치하지 않습니다.",
      });
    }

    members()
      .find({ id: req.member.id })
      .assign({
        password: bcrypt.hashSync(newPassword, 12),
        updated_at: new Date().toISOString(),
      })
      .write();

    return res.status(200).json({ message: "비밀번호가 변경되었습니다." });
  });

  // 회원탈퇴 (소프트 삭제)
  // POST /api/mypage/withdraw
  router.post("/withdraw", (req, res) => {
    const { password } = req.body;

    if (!isValidPassword(password)) {
      return res.status(400).json({ message: "비밀번호를 확인해주세요." });
    }

    if (!bcrypt.compareSync(password, req.member.password)) {
      return res.status(401).json({
        message: "비밀번호가 일치하지 않습니다.",
      });
    }

    const { id } = req.member;
    const now = new Date().toISOString();

    members()
      .find({ id })
      .assign({ status: 0, updated_at: now, deleted_at: now })
      .write();

    // 작성한 레시피는 남기고 회원 연결만 끊는다.
    recipes()
      .filter({ author: id })
      .value()
      .forEach((recipe) => {
        recipe.author = null;
      });
    db.write();

    favorites.removeByMember(id);

    return res.status(200).json({ message: "회원탈퇴가 완료되었습니다." });
  });

  // 내가 작성한 레시피 목록 (최신순)
  // GET /api/mypage/recipes?page=1&kind=user|ai (kind가 없으면 전체)
  router.get("/recipes", (req, res) => {
    const kind = parseKind(req.query.kind);

    if (!kind) return res.status(400).json(KIND_ERROR);

    const mine = filterByKind(
      recipes()
        .filter({ author: req.member.id })
        .value()
        .slice()
        .sort((a, b) => String(b.create_at).localeCompare(String(a.create_at))),
      kind,
    );

    const result = paginate(mine, req.query.page);

    return res.status(200).json({
      ...result,
      items: result.items.map(toCard),
    });
  });

  // 좋아요한 레시피 목록 (최근에 누른 순)
  // GET /api/mypage/favorites?page=1&kind=user|ai (kind가 없으면 전체)
  router.get("/favorites", (req, res) => {
    const kind = parseKind(req.query.kind);

    if (!kind) return res.status(400).json(KIND_ERROR);

    const mine = favorites.listByMember(req.member.id);

    // 삭제된 레시피는 목록에서 제외한다.
    const liked = mine
      .map((favorite) =>
        recipes()
          .find(
            (recipe) => String(recipe.id) === String(favorite.recipe_posts_id),
          )
          .value(),
      )
      .filter(Boolean);

    const result = paginate(filterByKind(liked, kind), req.query.page);

    return res.status(200).json({
      ...result,
      items: result.items.map(toCard),
    });
  });

  // 좋아요 추가 (이미 있으면 그대로 성공)
  // PUT /api/mypage/favorites/:recipeId
  router.put("/favorites/:recipeId", (req, res) => {
    const { recipeId } = req.params;

    const recipe = recipes()
      .find((item) => String(item.id) === recipeId)
      .value();

    if (!recipe) {
      return res.status(404).json({ message: "존재하지 않는 레시피입니다." });
    }

    const created = favorites.add(req.member.id, recipe.id);

    return res.status(created ? 201 : 200).json({
      message: "좋아요를 눌렀습니다.",
      liked: true,
      likes: favorites.count(recipe.id),
    });
  });

  // 좋아요 해제 (없어도 성공)
  // DELETE /api/mypage/favorites/:recipeId
  router.delete("/favorites/:recipeId", (req, res) => {
    const { recipeId } = req.params;

    favorites.remove(req.member.id, recipeId);

    return res.status(200).json({
      message: "좋아요를 취소했습니다.",
      liked: false,
      likes: favorites.count(recipeId),
    });
  });

  return router;
}

module.exports = { createMypageRouter };
