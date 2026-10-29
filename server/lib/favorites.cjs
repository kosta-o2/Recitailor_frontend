// favorites 테이블 접근 모음. ERD: id, members_id, recipe_posts_id
// 좋아요 수는 이 테이블을 세어서 구한다. 게시글에는 따로 저장하지 않는다.
function createFavoriteStore(db) {
  function table() {
    if (!Array.isArray(db.get("favorites").value())) {
      db.set("favorites", []).write();
    }

    return db.get("favorites");
  }

  // 이전 컬럼명(recipes_id)으로 저장된 행을 ERD 컬럼명(recipe_posts_id)으로 바꾼다.
  function migrate() {
    const legacy = table()
      .value()
      .filter((row) => row.recipe_posts_id === undefined && "recipes_id" in row);

    if (legacy.length === 0) return;

    legacy.forEach((row) => {
      row.recipe_posts_id = row.recipes_id;
      delete row.recipes_id;
    });
    db.write();
  }

  migrate();

  const isPost = (postId) => (row) =>
    String(row.recipe_posts_id) === String(postId);

  return {
    // 게시글별 좋아요 수 (key: 게시글 id 문자열)
    countsByPost() {
      const counts = new Map();

      for (const row of table().value()) {
        const key = String(row.recipe_posts_id);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }

      return counts;
    },

    count(postId) {
      return table().filter(isPost(postId)).size().value();
    },

    countByMember(memberId) {
      return table().filter({ members_id: memberId }).size().value();
    },

    // 회원이 좋아요한 게시글 id 집합 (문자열)
    likedPostIds(memberId) {
      return new Set(
        table()
          .filter({ members_id: memberId })
          .value()
          .map((row) => String(row.recipe_posts_id)),
      );
    },

    // 회원이 좋아요한 행 (최근에 누른 순)
    listByMember(memberId) {
      return table()
        .filter({ members_id: memberId })
        .value()
        .slice()
        .sort((a, b) => b.id - a.id);
    },

    // (members_id, recipe_posts_id)는 한 번만 저장한다. 새로 저장했으면 true
    add(memberId, postId) {
      const exists = table()
        .find((row) => row.members_id === memberId && isPost(postId)(row))
        .value();

      if (exists) return false;

      const nextId =
        table()
          .map("id")
          .value()
          .reduce((max, value) => Math.max(max, Number(value) || 0), 0) + 1;

      table()
        .push({ id: nextId, members_id: memberId, recipe_posts_id: postId })
        .write();

      return true;
    },

    remove(memberId, postId) {
      table()
        .remove((row) => row.members_id === memberId && isPost(postId)(row))
        .write();
    },

    // 게시글이 삭제되면 그 글의 좋아요도 함께 지운다.
    removeByPost(postId) {
      table().remove(isPost(postId)).write();
    },

    // 회원이 탈퇴하면 그 회원의 좋아요를 지운다.
    removeByMember(memberId) {
      table().remove({ members_id: memberId }).write();
    },
  };
}

module.exports = { createFavoriteStore };
