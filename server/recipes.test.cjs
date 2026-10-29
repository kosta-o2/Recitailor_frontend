const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const bcrypt = require("bcryptjs");

process.env.JWT_SECRET = "test-secret";

const { createApp } = require("./server.cjs");

const JPG = Buffer.concat([
  Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
  Buffer.alloc(100, 1),
]);
const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(100, 2),
]);

const POST = {
  title: "김치볶음밥",
  content: "맛있다",
  portion: "2인분",
  time: 15,
  all_ingredient: { ingredients: ["밥 1공기"], sauces: ["간장 1큰술"] },
  category: { method: "볶음", type: "밥/죽/떡" },
  recipes: ["볶는다"],
};

// 테스트 전용 임시 DB 파일을 만든다. 실제 db.json은 건드리지 않는다.
function seed(dir) {
  const dbFile = path.join(dir, "db.json");
  const now = new Date().toISOString();
  const member = (id, nickname) => ({
    id,
    password: bcrypt.hashSync("password1", 4),
    nickname,
    email: `${id}@test.com`,
    status: 1,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  });

  fs.writeFileSync(
    dbFile,
    JSON.stringify({
      members: [member("alice", "앨리스"), member("bob", "밥")],
      recipes: [
        {
          id: 1,
          title: "A",
          author: "시드작성자",
          img_url: "https://x/y.png",
          category: {},
          create_at: "2026-01-01",
        },
        {
          id: 2,
          title: "B",
          author: null,
          img_url: null,
          category: {},
          create_at: "2026-01-02",
        },
      ],
      favorites: [],
    }),
  );

  return dbFile;
}

async function start(dbFile, uploadDir) {
  const { server, db } = createApp({ dbFile, uploadDir });
  const http = await new Promise((resolve) => {
    const s = server.listen(0, () => resolve(s));
  });
  const base = `http://localhost:${http.address().port}`;

  return { base, db, close: () => new Promise((r) => http.close(r)) };
}

async function login(base, id) {
  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, password: "password1" }),
  });
  return (await res.json()).accessToken;
}

function form(post, file, name = "a.png", type = "image/png") {
  const f = new FormData();
  f.append("post", JSON.stringify(post));
  if (file) f.append("image", new Blob([file], { type }), name);
  return f;
}

const auth = (token) => ({ Authorization: `Bearer ${token}` });

test("게시글 이미지 업로드/조회", async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "recitailor-"));
  const dbFile = seed(dir);
  const uploadDir = path.join(dir, "images");
  let app = await start(dbFile, uploadDir);
  t.after(async () => {
    await app.close();
    fs.rmSync(dir, { recursive: true, force: true });
  });
  const token = await login(app.base, "alice");
  const post = (body, headers) =>
    fetch(`${app.base}/api/recipes`, { method: "POST", body, headers });

  let withImage;

  await t.test("이미지 없이 JSON 등록 + 작성자 위조 무시", async () => {
    const res = await post(
      JSON.stringify({
        ...POST,
        author: "bob",
        img_url: "/uploads/hack.png",
        id: 99,
        likes: 50,
      }),
      { ...auth(token), "Content-Type": "application/json" },
    );
    const body = await res.json();
    assert.equal(res.status, 201);
    assert.equal(body.id, 3);
    assert.equal(body.author, "앨리스");
    assert.equal(body.likes, 0);
    assert.deepEqual(body.images, []);
    assert.equal(body.img_url, null);
    assert.equal(app.db.get("recipes").find({ id: 3 }).value().author, "alice");
  });

  await t.test("JPG multipart 등록 → 파일/메타/조회", async () => {
    const res = await post(form(POST, JPG, "x.jpg", "image/jpeg"), auth(token));
    const body = await res.json();
    assert.equal(res.status, 201);
    withImage = body;
    assert.equal(body.images.length, 1);
    assert.equal(body.images[0].recipe_posts_id, body.id);
    assert.match(body.img_url, /^\/uploads\/[0-9a-f-]{36}\.jpg$/);
    assert.equal(fs.readdirSync(uploadDir).length, 1);

    const detail = await (
      await fetch(`${app.base}/api/recipes/${body.id}`)
    ).json();
    assert.equal(detail.img_url, body.img_url);
    assert.deepEqual(detail.images, body.images);

    const img = await fetch(`${app.base}${body.img_url}`);
    assert.equal(img.status, 200);
    assert.equal(img.headers.get("content-type"), "image/jpeg");
    assert.deepEqual(Buffer.from(await img.arrayBuffer()), JPG);
  });

  await t.test("PNG 등록", async () => {
    const res = await post(form(POST, PNG), auth(token));
    const body = await res.json();
    assert.equal(res.status, 201);
    assert.match(body.img_url, /\.png$/);
    const img = await fetch(`${app.base}${body.img_url}`);
    assert.equal(img.headers.get("content-type"), "image/png");
  });

  await t.test("목록: 이미지 합성, 기존 img_url 유지, 페이지네이션·정렬", async () => {
    const res = await fetch(
      `${app.base}/api/recipes?_page=1&_limit=2&_sort=id&_order=desc`,
    );
    const list = await res.json();
    assert.equal(res.headers.get("x-total-count"), "5");
    assert.deepEqual(
      list.map((r) => r.id),
      [5, 4],
    );
    assert.equal(list[0].images.length, 1);

    const all = await (await fetch(`${app.base}/api/recipes`)).json();
    assert.equal(all[0].img_url, "https://x/y.png");
    assert.deepEqual(all[0].images, []);
    assert.equal(all[0].author, "시드작성자");
    assert.equal(all[1].img_url, null);
  });

  await t.test("서버 재시작 후에도 조회", async () => {
    await app.close();
    app = await start(dbFile, uploadDir);
    const detail = await (
      await fetch(`${app.base}/api/recipes/${withImage.id}`)
    ).json();
    assert.deepEqual(detail.images, withImage.images);
    const img = await fetch(`${app.base}${withImage.img_url}`);
    assert.equal(img.status, 200);
    assert.equal(
      (await fetch(`${app.base}/api/recipe_post_images`)).status,
      200,
    );
  });

  await t.test("거절: 5MB 초과/위조 시그니처/GIF/빈 파일/잘못된 게시글", async () => {
    const before = fs.readdirSync(uploadDir).length;
    const count = app.db.get("recipes").size().value();

    let res = await post(
      form(POST, Buffer.concat([PNG, Buffer.alloc(5 * 1024 * 1024)])),
      auth(token),
    );
    assert.equal(res.status, 413);
    assert.ok((await res.json()).message);

    res = await post(form(POST, Buffer.from("not an image")), auth(token));
    assert.equal(res.status, 400);

    res = await post(
      form(POST, Buffer.from("GIF89a....."), "a.gif", "image/gif"),
      auth(token),
    );
    assert.equal(res.status, 400);

    res = await post(form(POST, Buffer.alloc(0)), auth(token));
    assert.equal(res.status, 400);

    res = await post(form({ ...POST, title: "" }, PNG), auth(token));
    assert.equal(res.status, 400);

    assert.equal(fs.readdirSync(uploadDir).length, before);
    assert.equal(app.db.get("recipes").size().value(), count);
  });

  await t.test("미인증/잘못된 토큰 차단", async () => {
    assert.equal((await post(form(POST, PNG))).status, 401);
    assert.equal((await post(form(POST, PNG), auth("bad"))).status, 401);
    assert.equal(fs.readdirSync(uploadDir).length, 2);
  });

  await t.test("기본 CRUD 쓰기 우회 차단", async () => {
    const json = { "Content-Type": "application/json" };
    const calls = [
      ["POST", "/api/recipe_post_images"],
      ["PUT", "/api/recipes/1"],
      ["PATCH", "/api/recipes/1"],
      ["DELETE", "/api/recipes/1"],
      ["PATCH", "/api/recipe_post_images/1"],
      ["DELETE", "/api/recipe_post_images/1"],
    ];
    for (const [method, url] of calls) {
      const res = await fetch(app.base + url, {
        method,
        headers: { ...json, ...auth(token) },
        body: method === "DELETE" ? undefined : "{}",
      });
      assert.equal(res.status, 403, `${method} ${url}`);
    }
    const res = await fetch(`${app.base}/api/recipes/1`, {
      method: "POST",
      headers: { ...json, "X-HTTP-Method-Override": "DELETE" },
      body: "{}",
    });
    assert.equal(res.status, 403);
    assert.equal((await fetch(`${app.base}/api/recipes/1`)).status, 200);
  });

  await t.test("회원 정보/인증 API 동작 유지", async () => {
    assert.equal((await fetch(`${app.base}/api/members`)).status, 403);
    assert.equal((await fetch(`${app.base}/api/db`)).status, 403);
    assert.equal((await fetch(`${app.base}/api/mypage`)).status, 401);
    const me = await (
      await fetch(`${app.base}/api/mypage`, { headers: auth(token) })
    ).json();
    assert.equal(me.member.id, "alice");
    assert.equal(me.postCount, 3);
    const bad = await fetch(`${app.base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "alice", password: "wrong-pass" }),
    });
    assert.equal(bad.status, 401);
  });

  await t.test("uploads 경로 탈출/목록 노출 차단", async () => {
    for (const p of [
      "/uploads/",
      "/uploads/..%2fdb.json",
      "/uploads/%2e%2e/db.json",
      "/uploads/nope.png",
    ]) {
      const res = await fetch(app.base + p);
      assert.notEqual(res.status, 200, p);
      assert.ok(!(await res.text()).includes("members"), p);
    }
  });

  await t.test("DB 저장 실패 시 파일/데이터 정리", async () => {
    const before = fs.readdirSync(uploadDir).length;
    const recipes = app.db.get("recipes").size().value();
    const images = app.db.get("recipe_post_images").size().value();
    const originalWrite = app.db.write;
    app.db.write = () => {
      throw new Error("disk full");
    };
    const res = await post(form(POST, PNG), auth(token));
    app.db.write = originalWrite;
    assert.equal(res.status, 500);
    const text = JSON.stringify(await res.json());
    assert.ok(!text.includes(uploadDir) && !text.includes("disk full"));
    assert.equal(fs.readdirSync(uploadDir).length, before);
    assert.equal(app.db.get("recipes").size().value(), recipes);
    assert.equal(app.db.get("recipe_post_images").size().value(), images);
  });
});

test("AI 레시피 post_type 저장/노출", async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "recitailor-"));
  const app = await start(seed(dir), path.join(dir, "images"));
  t.after(async () => {
    await app.close();
    fs.rmSync(dir, { recursive: true, force: true });
  });
  const token = await login(app.base, "alice");
  const create = async (extra) => {
    const res = await fetch(`${app.base}/api/recipes`, {
      method: "POST",
      headers: { ...auth(token), "Content-Type": "application/json" },
      body: JSON.stringify({ ...POST, ...extra }),
    });
    return { res, body: await res.json() };
  };

  await t.test("ai_create / ai_search 는 그대로 저장", async () => {
    const created = await create({ post_type: "ai_create" });
    assert.equal(created.res.status, 201);
    assert.equal(created.body.post_type, "ai_create");
    assert.equal((await create({ post_type: "ai_search" })).body.post_type, "ai_search");
  });

  await t.test("미지정/알 수 없는 값은 normal", async () => {
    assert.equal((await create({})).body.post_type, "normal");
    assert.equal((await create({ post_type: "admin" })).body.post_type, "normal");
  });

  await t.test("마이페이지 목록에 post_type 노출 (없으면 normal)", async () => {
    const res = await fetch(`${app.base}/api/mypage/recipes`, {
      headers: auth(token),
    });
    const { items } = await res.json();
    const types = items.map((item) => item.post_type).sort();
    assert.deepEqual(types, ["ai_create", "ai_search", "normal", "normal"]);
  });
});

test("좋아요: favorites 집계, 정렬, 삭제 정리", async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "recitailor-"));
  const app = await start(seed(dir), path.join(dir, "images"));
  t.after(async () => {
    await app.close();
    fs.rmSync(dir, { recursive: true, force: true });
  });
  const alice = await login(app.base, "alice");
  const bob = await login(app.base, "bob");
  const like = (token, id) =>
    fetch(`${app.base}/api/mypage/favorites/${id}`, {
      method: "PUT",
      headers: auth(token),
    });
  const unlike = (token, id) =>
    fetch(`${app.base}/api/mypage/favorites/${id}`, {
      method: "DELETE",
      headers: auth(token),
    });
  const get = async (url, token) =>
    (await fetch(`${app.base}/api/${url}`, { headers: token ? auth(token) : {} })).json();

  await t.test("좋아요하면 ERD 컬럼(recipe_posts_id)으로 저장되고 중복되지 않는다", async () => {
    assert.equal((await like(alice, 2)).status, 201);
    assert.equal((await like(alice, 2)).status, 200);

    const rows = app.db.get("favorites").value();
    assert.equal(rows.length, 1);
    assert.deepEqual(Object.keys(rows[0]).sort(), ["id", "members_id", "recipe_posts_id"]);
    assert.equal(rows[0].recipe_posts_id, 2);
  });

  await t.test("목록/상세에 집계된 likes와 내 liked가 담긴다", async () => {
    await like(bob, 2);

    const asAlice = await get("recipes", alice);
    assert.equal(asAlice.find((r) => r.id === 2).likes, 2);
    assert.equal(asAlice.find((r) => r.id === 2).liked, true);
    assert.equal(asAlice.find((r) => r.id === 1).likes, 0);
    assert.equal(asAlice.find((r) => r.id === 1).liked, false);

    const anonymous = await get("recipes/2");
    assert.equal(anonymous.likes, 2);
    assert.equal(anonymous.liked, false);
  });

  await t.test("좋아요 순 정렬은 favorites 집계 기준이다", async () => {
    const list = await get("recipes?_sort=likes&_order=desc");
    assert.deepEqual(list.map((r) => r.id), [2, 1]);

    await unlike(alice, 2);
    await unlike(bob, 2);
    await like(bob, 1);

    const after = await get("recipes?_sort=likes&_order=desc");
    assert.deepEqual(after.map((r) => r.id), [1, 2]);
    assert.equal(after[0].likes, 1);
  });

  await t.test("마이페이지 좋아요 목록과 개수가 맞는다", async () => {
    const mine = await get("mypage/favorites", bob);
    assert.equal(mine.total, 1);
    assert.equal(mine.items[0].id, 1);

    const info = await get("mypage", bob);
    assert.equal(info.favoriteCount, 1);
  });

  await t.test("게시글을 삭제하면 그 글의 좋아요도 사라진다", async () => {
    const created = await (
      await fetch(`${app.base}/api/recipes`, {
        method: "POST",
        headers: { ...auth(alice), "Content-Type": "application/json" },
        body: JSON.stringify(POST),
      })
    ).json();

    await like(bob, created.id);
    assert.equal((await get("mypage", bob)).favoriteCount, 2);

    const del = await fetch(`${app.base}/api/recipes/${created.id}`, {
      method: "DELETE",
      headers: auth(alice),
    });
    assert.equal(del.status, 200);

    assert.equal((await get("mypage", bob)).favoriteCount, 1);

    // 같은 id로 새 글이 만들어져도 이전 좋아요를 이어받지 않는다.
    const next = await (
      await fetch(`${app.base}/api/recipes`, {
        method: "POST",
        headers: { ...auth(alice), "Content-Type": "application/json" },
        body: JSON.stringify(POST),
      })
    ).json();
    assert.equal(next.id, created.id);
    assert.equal(next.likes, 0);
    assert.equal(next.liked, false);
  });

  await t.test("AI 글도 좋아요할 수 있다", async () => {
    const ai = await (
      await fetch(`${app.base}/api/recipes`, {
        method: "POST",
        headers: { ...auth(alice), "Content-Type": "application/json" },
        body: JSON.stringify({ ...POST, post_type: "ai_create" }),
      })
    ).json();

    assert.equal((await like(bob, ai.id)).status, 201);
    assert.equal((await get(`recipes/${ai.id}`, bob)).likes, 1);
  });

  await t.test("존재하지 않는 글/미로그인은 거절한다", async () => {
    assert.equal((await like(alice, 999)).status, 404);

    const res = await fetch(`${app.base}/api/mypage/favorites/1`, { method: "PUT" });
    assert.equal(res.status, 401);
  });
});

test("이전 컬럼명(recipes_id)의 favorites는 시작할 때 recipe_posts_id로 바뀐다", async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "recitailor-"));
  const dbFile = seed(dir);
  const data = JSON.parse(fs.readFileSync(dbFile, "utf8"));
  data.favorites = [{ id: 1, members_id: "alice", recipes_id: 2 }];
  fs.writeFileSync(dbFile, JSON.stringify(data));

  const app = await start(dbFile, path.join(dir, "images"));
  t.after(async () => {
    await app.close();
    fs.rmSync(dir, { recursive: true, force: true });
  });

  assert.deepEqual(app.db.get("favorites").value(), [
    { id: 1, members_id: "alice", recipe_posts_id: 2 },
  ]);
  assert.equal(
    (await (await fetch(`${app.base}/api/recipes/2`)).json()).likes,
    1,
  );
});
