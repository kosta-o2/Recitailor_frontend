const express = require("express");
const multer = require("multer");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const {
  createRequireAuth,
  createOptionalAuth,
} = require("../middleware/requireAuth.cjs");
const { createFavoriteStore } = require("../lib/favorites.cjs");
const {
  AI_POST_TYPES,
  parseKind,
  filterByKind,
} = require("../lib/postTypes.cjs");

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_POST_JSON_SIZE = 1024 * 1024;
const UPLOAD_URL_PREFIX = "/uploads";

const PROTECTED_COLLECTIONS = /^\/(recipes|recipe_post_images)(\/|$)/i;

// 파일 앞부분(시그니처)으로 실제 형식을 판별한다. 클라이언트 MIME/확장자는 믿지 않는다.
function detectImageExtension(buffer) {
  if (
    buffer.length >= 3 &&
    buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))
  ) {
    return ".jpg";
  }

  if (
    buffer.length >= 8 &&
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return ".png";
  }

  return null;
}

function isNonEmptyString(value, maxLength) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    Array.from(value.trim()).length <= maxLength
  );
}

function cleanStringList(value, maxItems, maxLength) {
  if (!Array.isArray(value) || value.length > maxItems) return null;

  const items = [];

  for (const item of value) {
    if (typeof item !== "string") return null;

    const trimmed = item.trim();

    if (!trimmed) continue;
    if (Array.from(trimmed).length > maxLength) return null;

    items.push(trimmed);
  }

  return items;
}

class ValidationError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

// 게시글 입력값 검증. 허용한 필드만 골라서 반환한다.
function parsePost(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ValidationError("게시글 정보가 올바르지 않습니다.");
  }

  if (!isNonEmptyString(input.title, 100)) {
    throw new ValidationError("레시피 제목은 1자 이상 100자 이하여야 합니다.");
  }

  const content = input.content ?? "";
  const portion = input.portion ?? "";

  if (typeof content !== "string" || Array.from(content).length > 2000) {
    throw new ValidationError("레시피 소개는 2000자 이하여야 합니다.");
  }

  if (typeof portion !== "string" || Array.from(portion).length > 30) {
    throw new ValidationError("인분은 30자 이하여야 합니다.");
  }

  let time = input.time ?? null;

  if (time !== null) {
    if (!Number.isInteger(time) || time < 0 || time > 100000) {
      throw new ValidationError("조리 시간은 0 이상의 정수(분)여야 합니다.");
    }
  }

  const ingredients = cleanStringList(
    input.all_ingredient?.ingredients,
    100,
    100,
  );
  const sauces = cleanStringList(input.all_ingredient?.sauces ?? [], 100, 100);
  const steps = cleanStringList(input.recipes, 100, 1000);

  if (!ingredients || ingredients.length === 0) {
    throw new ValidationError("재료를 한 개 이상 입력해 주세요.");
  }

  if (!sauces) {
    throw new ValidationError("양념 정보가 올바르지 않습니다.");
  }

  if (!steps || steps.length === 0) {
    throw new ValidationError("조리 순서를 한 단계 이상 입력해 주세요.");
  }

  if (
    !isNonEmptyString(input.category?.method, 30) ||
    !isNonEmptyString(input.category?.type, 30)
  ) {
    throw new ValidationError("조리 방식과 요리 종류를 선택해 주세요.");
  }

  // 일반 작성은 normal, AI 결과를 저장할 때만 ai_search / ai_create. 그 외 값은 normal로 본다.
  const postType = AI_POST_TYPES.includes(input.post_type)
    ? input.post_type
    : "normal";

  return {
    title: input.title.trim(),
    post_type: postType,
    content: content.trim(),
    portion: portion.trim(),
    time,
    all_ingredient: { ingredients, sauces },
    category: {
      method: input.category.method.trim(),
      type: input.category.type.trim(),
    },
    recipes: steps,
  };
}

function nextId(list) {
  return list.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

function createRecipesRouter(db, { uploadDir }) {
  const router = express.Router();
  const requireAuth = createRequireAuth(db);
  const optionalAuth = createOptionalAuth(db);
  const favorites = createFavoriteStore(db);

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: MAX_IMAGE_SIZE,
      files: 1,
      fields: 5,
      fieldSize: MAX_POST_JSON_SIZE,
    },
  }).single("image");

  // multer 오류를 프론트가 표시할 수 있는 JSON으로 바꾼다.
  function receiveMultipart(req, res, next) {
    if (!req.is("multipart/form-data")) return next();

    upload(req, res, (error) => {
      if (!error) return next();

      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          message: "이미지 크기는 5MB 이하만 가능합니다.",
        });
      }

      if (error instanceof multer.MulterError) {
        return res.status(400).json({
          message: "업로드 요청이 올바르지 않습니다.",
        });
      }

      return next(error);
    });
  }

  function images() {
    return db.get("recipe_post_images");
  }

  // 조회 응답용: 이미지, 작성자 닉네임, 좋아요 수(favorites 집계)와 내 좋아요 여부를 게시글에 합친다.
  function createViewBuilder(memberId = null) {
    const byPost = new Map();
    const likeCounts = favorites.countsByPost();
    const likedIds = memberId ? favorites.likedPostIds(memberId) : new Set();

    for (const image of images().value()) {
      const key = String(image.recipe_posts_id);

      if (!byPost.has(key)) byPost.set(key, []);

      byPost.get(key).push(image);
    }

    const nicknames = new Map(
      db
        .get("members")
        .value()
        .filter((member) => member.status === 1 && member.deleted_at === null)
        .map((member) => [member.id, member.nickname]),
    );

    return (recipe) => {
      const linked = byPost.get(String(recipe.id)) ?? [];

      return {
        ...recipe,
        author: nicknames.get(recipe.author) ?? recipe.author,
        likes: likeCounts.get(String(recipe.id)) ?? 0,
        liked: likedIds.has(String(recipe.id)),
        images: linked,
        img_url: linked[0]?.img_url ?? recipe.img_url ?? null,
      };
    };
  }

  // JSON Server 기본 GET 응답에 이미지를 합친다. 페이지네이션/정렬은 그대로 둔다.
  function decorateRecipeResponse(req, res) {
    const originalJsonp = res.jsonp.bind(res);

    res.jsonp = (data) => {
      const build = createViewBuilder(req.member?.id);

      if (Array.isArray(data)) {
        return originalJsonp(
          data.map((item) =>
            item && typeof item === "object" ? build(item) : item,
          ),
        );
      }

      if (data && typeof data === "object" && "id" in data) {
        return originalJsonp(build(data));
      }

      return originalJsonp(data);
    };
  }

  // 게시글 등록 (JSON 또는 multipart/form-data)
  // POST /api/recipes
  router.post(
    "/recipes",
    requireAuth,
    receiveMultipart,
    async (req, res, next) => {
      let savedFile = null;
      let recipe = null;
      let imageRow = null;

      try {
        let postInput = req.body;

        if (req.is("multipart/form-data")) {
          try {
            postInput = JSON.parse(req.body?.post);
          } catch {
            throw new ValidationError("게시글 정보가 올바르지 않습니다.");
          }
        }

        const post = parsePost(postInput);

        let extension = null;

        if (req.file) {
          if (req.file.size === 0) {
            throw new ValidationError("비어 있는 이미지 파일입니다.");
          }

          extension = detectImageExtension(req.file.buffer);

          if (!extension) {
            throw new ValidationError(
              "JPG 또는 PNG 이미지만 업로드할 수 있습니다.",
            );
          }
        }

        if (req.file) {
          const filename = `${randomUUID()}${extension}`;

          await fs.promises.mkdir(uploadDir, { recursive: true });
          await fs.promises.writeFile(
            path.join(uploadDir, filename),
            req.file.buffer,
            { flag: "wx" },
          );

          savedFile = path.join(uploadDir, filename);
          imageRow = { img_url: `${UPLOAD_URL_PREFIX}/${filename}` };
        }

        // 아래 구간은 동기 처리라 ID 발급과 저장 사이에 다른 요청이 끼어들지 않는다.
        const recipeList = db.get("recipes").value();
        const now = new Date().toISOString();

        recipe = {
          id: nextId(recipeList),
          ...post,
          author: req.member.id,
          likes: 0,
          img_url: null,
          create_at: now,
          update_at: now,
        };

        recipeList.push(recipe);

        if (imageRow) {
          const imageList = images().value();

          imageRow = {
            id: nextId(imageList),
            img_url: imageRow.img_url,
            recipe_posts_id: recipe.id,
          };
          imageList.push(imageRow);
        }

        db.write();

        const [created] = [recipe].map(createViewBuilder(req.member.id));

        return res.status(201).json(created);
      } catch (error) {
        // 게시글·이미지가 일부만 남지 않도록 메모리 상태와 파일을 되돌린다.
        if (recipe) {
          const list = db.get("recipes").value();
          const index = list.indexOf(recipe);

          if (index !== -1) list.splice(index, 1);
        }

        if (imageRow?.id) {
          const list = images().value();
          const index = list.indexOf(imageRow);

          if (index !== -1) list.splice(index, 1);
        }

        if (savedFile) {
          await fs.promises.rm(savedFile, { force: true }).catch(() => {});
        }

        if (error instanceof ValidationError) {
          return res.status(error.status).json({ message: error.message });
        }

        return next(error);
      }
    },
  );

  // 게시글 수정
  // PATCH /api/recipes/:id
  router.patch(
    "/recipes/:id",
    requireAuth,
    receiveMultipart,
    async (req, res, next) => {
      let savedFile = null;
      let originalRecipe = null;
      let originalImages = null;
      let updatedRecipe = null;

      try {
        // 1. 게시글 ID 검증
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
          throw new ValidationError("올바르지 않은 게시글 ID입니다.");
        }

        // 2. 기존 게시글 조회
        const recipe = db.get("recipes").find({ id }).value();

        if (!recipe) {
          return res.status(404).json({
            message: "게시글을 찾을 수 없습니다.",
          });
        }

        // 3. 작성자 본인 확인
        if (String(recipe.author) !== String(req.member.id)) {
          return res.status(403).json({
            message: "본인이 작성한 게시글만 수정할 수 있습니다.",
          });
        }

        // 4. FormData에서 게시글 데이터 추출
        let postInput = req.body;

        if (req.is("multipart/form-data")) {
          try {
            postInput = JSON.parse(req.body?.post);
          } catch {
            throw new ValidationError("게시글 정보가 올바르지 않습니다.");
          }
        }

        // 5. 기존 검증 함수 재사용
        const post = parsePost(postInput);

        // 6. 새로운 이미지 파일 검증
        let extension = null;

        if (req.file) {
          if (req.file.size === 0) {
            throw new ValidationError("비어 있는 이미지 파일입니다.");
          }

          extension = detectImageExtension(req.file.buffer);

          if (!extension) {
            throw new ValidationError(
              "JPG 또는 PNG 이미지만 업로드할 수 있습니다.",
            );
          }
        }
        const removeImage = req.body?.removeImage === "true";
        // 7. 새로운 이미지 저장
        let newImageUrl = null;

        if (req.file) {
          const filename = `${randomUUID()}${extension}`;

          await fs.promises.mkdir(uploadDir, {
            recursive: true,
          });

          savedFile = path.join(uploadDir, filename);

          await fs.promises.writeFile(savedFile, req.file.buffer, {
            flag: "wx",
          });

          newImageUrl = `${UPLOAD_URL_PREFIX}/${filename}`;
        }

        // 8. 기존 데이터 백업
        originalRecipe = { ...recipe };

        const imageList = images().value();

        originalImages = imageList.map((image) => ({ ...image }));

        const linkedImages = imageList.filter(
          (image) => String(image.recipe_posts_id) === String(id),
        );

        // 9. 게시글 수정
        // post_type은 수정할 수 없다. (AI 글이 일반 글로 바뀌지 않게 기존 값을 유지)
        Object.assign(recipe, {
          ...post,
          post_type: recipe.post_type || "normal",
          ...(removeImage || newImageUrl ? { img_url: null } : {}),
          update_at: new Date().toISOString(),
        });
        updatedRecipe = recipe;

        // 10. 새 이미지가 있다면 기존 이미지 정보 교체
        // 이미지 삭제 요청 또는 새 이미지 업로드 시
        if (removeImage || newImageUrl) {
          // 기존 이미지 DB 정보 삭제
          for (let i = imageList.length - 1; i >= 0; i--) {
            if (String(imageList[i].recipe_posts_id) === String(id)) {
              imageList.splice(i, 1);
            }
          }

          // 새 이미지가 있을 경우에만 등록
          if (newImageUrl) {
            imageList.push({
              id: nextId(originalImages),
              img_url: newImageUrl,
              recipe_posts_id: id,
            });
          }
        }

        // 11. DB 저장
        db.write();

        // 12. 수정된 게시글 반환용 데이터 생성
        const result = createViewBuilder(req.member.id)(recipe);
        // 13. 교체된 기존 이미지 파일 삭제
        if (removeImage || newImageUrl) {
          for (const oldImage of linkedImages) {
            if (!oldImage.img_url?.startsWith(`${UPLOAD_URL_PREFIX}/`)) {
              continue;
            }

            const filename = path.basename(oldImage.img_url);
            const filePath = path.join(uploadDir, filename);

            await fs.promises
              .rm(filePath, {
                force: true,
              })
              .catch((error) => {
                console.error("기존 이미지 삭제 실패:", error);
              });
          }
        }

        return res.status(200).json({
          message: "게시글이 수정되었습니다.",
          recipe: result,
        });
      } catch (error) {
        // DB 변경 중 오류가 발생한 경우 메모리 데이터 복구
        if (originalRecipe && updatedRecipe) {
          Object.keys(updatedRecipe).forEach(
            (key) => delete updatedRecipe[key],
          );

          Object.assign(updatedRecipe, originalRecipe);
        }

        if (originalImages) {
          const imageList = images().value();
          imageList.splice(0, imageList.length, ...originalImages);
        }

        // 신규 업로드 파일 제거
        if (savedFile) {
          await fs.promises
            .rm(savedFile, {
              force: true,
            })
            .catch(() => {});
        }

        if (error instanceof ValidationError) {
          return res.status(error.status).json({
            message: error.message,
          });
        }

        next(error);
      }
    },
  );
  // 게시글 검색 및 페이지네이션
  // GET /api/recipes/search
  router.get("/recipes/search", (req, res, next) => {
    try {
      const keyword = String(req.query.keyword ?? "")
        .trim()
        .toLowerCase();

      const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);

      const limit = Math.max(1, Number.parseInt(req.query.limit, 10) || 3);

      const sortBy = req.query.sortBy;
      const sortOrder = req.query.sortOrder;

      // 1. 전체 게시글 조회
      let posts = db.get("recipes").value();

      // 게시판 구분: ?kind=user 는 일반 글, ?kind=ai 는 AI 글만 (없으면 전체)
      const kind = parseKind(req.query.kind);

      if (kind === null) {
        return res.status(400).json({
          message: "kind는 user 또는 ai여야 합니다.",
        });
      }

      posts = filterByKind(posts, kind);

      // 2. 검색어 필터링
      if (keyword) {
        posts = posts.filter((post) => {
          const ingredients = Array.isArray(post.all_ingredient?.ingredients)
            ? post.all_ingredient.ingredients
            : [];

          const sauces = Array.isArray(post.all_ingredient?.sauces)
            ? post.all_ingredient.sauces
            : [];

          const searchText = [
            post.title ?? "",
            post.content ?? "",
            ...ingredients,
            ...sauces,
          ]
            .join(" ")
            .toLowerCase();

          return searchText.includes(keyword);
        });
      }

      // 3. 정렬
      if (
        ["create_at", "likes"].includes(sortBy) &&
        ["asc", "desc"].includes(sortOrder)
      ) {
        posts = [...posts].sort((a, b) => {
          const aValue = a[sortBy];
          const bValue = b[sortBy];

          let result = 0;

          if (sortBy === "likes") {
            result = Number(aValue ?? 0) - Number(bValue ?? 0);
          } else {
            result = String(aValue ?? "").localeCompare(String(bValue ?? ""));
          }

          return sortOrder === "desc" ? -result : result;
        });
      }

      // 4. 검색 결과 기준 페이지 수 계산
      const total = posts.length;
      const last = Math.ceil(total / limit);

      // 5. 페이지네이션
      const start = (page - 1) * limit;
      const paginatedPosts = posts.slice(start, start + limit);

      // 6. 이미지와 작성자 정보 결합
      const buildView = createViewBuilder();

      const data = paginatedPosts.map(buildView);

      // 7. 결과 반환
      return res.status(200).json({
        data,
        total,
        page,
        last,
      });
    } catch (error) {
      next(error);
    }
  });
  // 게시글 삭제
  // DELETE /api/recipes/:id
  router.delete("/recipes/:id", requireAuth, async (req, res, next) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
          message: "올바르지 않은 게시글 ID입니다.",
        });
      }

      const recipe = db.get("recipes").find({ id }).value();

      if (!recipe) {
        return res.status(404).json({
          message: "게시글을 찾을 수 없습니다.",
        });
      }

      // 본인이 작성한 게시글인지 확인
      if (String(recipe.author) !== String(req.member.id)) {
        return res.status(403).json({
          message: "본인이 작성한 게시글만 삭제할 수 있습니다.",
        });
      }

      // 게시글에 연결된 이미지 정보 조회
      const linkedImages = db
        .get("recipe_post_images")
        .filter({ recipe_posts_id: id })
        .value();

      // 게시글 및 이미지 데이터 삭제
      db.get("recipes").remove({ id }).write();

      db.get("recipe_post_images").remove({ recipe_posts_id: id }).write();

      // 삭제된 게시글의 좋아요도 함께 지운다. (같은 id로 새 글이 생겨도 이어받지 않게)
      favorites.removeByPost(id);

      // 저장된 이미지 파일 삭제
      for (const image of linkedImages) {
        if (!image.img_url?.startsWith(`${UPLOAD_URL_PREFIX}/`)) continue;

        const filename = path.basename(image.img_url);
        const filePath = path.join(uploadDir, filename);

        await fs.promises.rm(filePath, { force: true });
      }

      return res.status(200).json({
        message: "게시글이 삭제되었습니다.",
      });
    } catch (error) {
      next(error);
    }
  });

  // 게시글/이미지 데이터의 나머지 쓰기는 모두 차단한다.
  // (검증·소유권 검사를 우회하는 기본 CRUD, X-HTTP-Method-Override 포함)
  router.use((req, res, next) => {
    if (
      PROTECTED_COLLECTIONS.test(req.path) &&
      (!["GET", "HEAD", "OPTIONS"].includes(req.method) ||
        req.get("X-HTTP-Method-Override"))
    ) {
      return res.status(403).json({
        message: "이 경로로는 데이터를 변경할 수 없습니다.",
      });
    }

    if (
      /^\/recipes(\/|$)/i.test(req.path) &&
      ["GET", "HEAD"].includes(req.method)
    ) {
      // JSON Server가 정렬(_sort=likes)·필터(post_type)할 수 있게 메모리 값을 맞춰 둔다.
      // likes는 favorites 집계값, post_type이 없는 기존 글은 normal로 본다.
      const likeCounts = favorites.countsByPost();

      for (const recipe of db.get("recipes").value()) {
        recipe.likes = likeCounts.get(String(recipe.id)) ?? 0;
        recipe.post_type = recipe.post_type || "normal";
      }

      // 목록 구분: ?kind=user 는 일반 글, ?kind=ai 는 AI 글만 (없으면 전체)
      if (req.query.kind !== undefined && /^\/recipes\/?$/i.test(req.path)) {
        const kind = req.query.kind;

        delete req.query.kind;

        if (kind === "user") {
          req.query.post_type = "normal";
        } else if (kind === "ai") {
          req.query.post_type = AI_POST_TYPES;
        } else {
          return res.status(400).json({
            message: "kind는 user 또는 ai여야 합니다.",
          });
        }
      }

      optionalAuth(req, res, () => {});
      decorateRecipeResponse(req, res);
    }

    return next();
  });

  return router;
}

module.exports = {
  createRecipesRouter,
  detectImageExtension,
  MAX_IMAGE_SIZE,
};
