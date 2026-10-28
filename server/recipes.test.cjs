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
