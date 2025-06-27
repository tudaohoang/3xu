const API_HOST = process.env.REACT_APP_API_HOST || "";

// API utility for all fetch calls
export const fetchNovels = async ({ title = "", page = 1, limit = 20 }) => {
  const res = await fetch(
    `${API_HOST}/api/novels?title=${encodeURIComponent(
      title
    )}&page=${page}&limit=${limit}`
  );
  if (!res.ok) throw new Error("Failed to fetch novels");
  const result = await res.json();
  console.log("fetchNovels result:", result);
  // Normalize the response to always return { novels, total, totalPages, from, to }
  return {
    novels: result.novels || result.data || [],
    total: result.total || result.totalRecords || 0,
    totalPages:
      result.totalPages ||
      Math.ceil((result.total || result.totalRecords || 0) / limit),
    from: result.from || (page - 1) * limit + 1,
    to:
      result.to ||
      Math.min(page * limit, result.total || result.totalRecords || 0),
  };
};

export const fetchNovelDetail = async (id) => {
  const res = await fetch(`${API_HOST}/api/novel-detail?id=${id}`);
  if (!res.ok) throw new Error("Failed to fetch novel detail");
  return res.json();
};

export const fetchChapters = async (id, page = 1, limit = 50) => {
  const res = await fetch(
    `${API_HOST}/api/novels/${id}/chapters?page=${page}&limit=${limit}`
  );
  if (!res.ok) throw new Error("Failed to fetch chapters");
  return res.json();
};

export const fetchChapterContent = async (url) => {
  const res = await fetch(
    `${API_HOST}/api/chapter-content?url=${encodeURIComponent(url)}`
  );
  if (!res.ok) throw new Error("Failed to fetch chapter content");
  return res.json();
};
