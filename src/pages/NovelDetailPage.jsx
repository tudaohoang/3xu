import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Card,
  List,
  Spin,
  Alert,
  Button,
  Modal,
  Progress,
} from "antd";
import { fetchNovelDetail, fetchChapterContent } from "../api/novelApi";
import { useAsync } from "../hooks/useAsync";
import LZString from "lz-string";
import { get, update } from "idb-keyval";
//import logo from "../logo.svg";
import Header from "../components/Header";
import Footer from "../components/Footer";

const { Title, Text, Paragraph } = Typography;

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);
  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <Button
      shape="circle"
      size="large"
      style={{
        position: "fixed",
        right: 32,
        bottom: 32,
        zIndex: 1000,
        display: visible ? "inline-flex" : "none",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        background: "#fff",
      }}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
    >
      <span style={{ fontSize: 20, lineHeight: 1 }}>&uarr;</span>
    </Button>
  );
};

const NovelDetailPage = () => {
  const { id } = useParams();
  //const [page, setPage] = useState(1);
  // const limit = 50;
  const navigate = useNavigate();
  const [descExpanded, setDescExpanded] = useState(false);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [downloadModal, setDownloadModal] = useState({
    open: false,
    percent: 0,
    current: 0,
    total: 0,
  });

  const {
    data: novelData,
    loading: loadingNovel,
    error: errorNovel,
  } = useAsync(() => fetchNovelDetail(id), [id]);

  // Extract novel info and chaptersData from the response
  const novel = useMemo(
    () =>
      novelData
        ? {
            title: novelData.title,
            author: novelData.author,
            description: novelData.description,
            cover_image: novelData.cover_image,
            genre: novelData.genre,
          }
        : null,
    [novelData]
  );
  const chaptersData = useMemo(
    () =>
      novelData
        ? {
            chapters: novelData.chapters || [],
            total:
              novelData.total_chapters ||
              (novelData.chapters ? novelData.chapters.length : 0),
          }
        : null,
    [novelData]
  );

  // Get downloaded chapters for this novel from IndexedDB
  const [downloadedUrls, setDownloadedUrls] = useState([]);
  React.useEffect(() => {
    let ignore = false;
    async function fetchDownloaded() {
      if (!novel) return;
      const key = `${novel.title}__${novel.author}`;
      const saved = await get(key);
      if (!ignore && saved && saved.chapters) {
        setDownloadedUrls(saved.chapters.map((c) => c.url));
      } else if (!ignore) {
        setDownloadedUrls([]);
      }
    }
    fetchDownloaded();
    return () => {
      ignore = true;
    };
  }, [novel]);

  const handleChapterSelect = (chapterUrl) => {
    setSelectedChapters((prev) =>
      prev.includes(chapterUrl)
        ? prev.filter((url) => url !== chapterUrl)
        : [...prev, chapterUrl]
    );
  };

  const handleSelectAll = () => {
    if (!selectAll) {
      setSelectedChapters(chaptersData.chapters.map((chapter) => chapter.url));
    } else {
      setSelectedChapters([]);
    }
    setSelectAll(!selectAll);
  };

  const handleDownloadSelected = async () => {
    if (!novel || !chaptersData) return;
    const selected = chaptersData.chapters.filter((c) =>
      selectedChapters.includes(c.url)
    );
    if (selected.length === 0) return;
    setDownloadModal({
      open: true,
      percent: 0,
      current: 0,
      total: selected.length,
    });
    let completed = 0;
    const chaptersWithContent = [];
    for (const chapter of selected) {
      try {
        const data = await fetchChapterContent(chapter.url);
        chaptersWithContent.push({
          ...chapter,
          content: LZString.compress(data.content || ""),
        });
      } catch (e) {
        chaptersWithContent.push({
          ...chapter,
          content: LZString.compress("[Lỗi tải nội dung]"),
        });
      }
      completed++;
      setDownloadModal({
        open: true,
        percent: Math.round((completed / selected.length) * 100),
        current: completed,
        total: selected.length,
      });
    }
    // Save to IndexedDB
    const key = `${novel.title}__${novel.author}`;
    await update(key, (old) => {
      if (!old) return { ...novel, chapters: chaptersWithContent };
      const existingUrls = new Set((old.chapters || []).map((c) => c.url));
      const newChapters = chaptersWithContent.filter(
        (c) => !existingUrls.has(c.url)
      );
      return { ...old, chapters: [...(old.chapters || []), ...newChapters] };
    });
    // Update UI
    const saved = await get(key);
    setDownloadedUrls(
      saved && saved.chapters ? saved.chapters.map((c) => c.url) : []
    );
    setSelectedChapters([]);
    setSelectAll(false);
    setDownloadModal({ open: false, percent: 0, current: 0, total: 0 });
  };

  return (
    <>
      <Header />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        {loadingNovel && (
          <Spin style={{ display: "block", margin: "40px auto" }} />
        )}
        {errorNovel && (
          <Alert
            type="error"
            message={errorNovel.message}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        {novel && (
          <Card style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 24 }}>
              {novel.cover_image && (
                <img
                  src={novel.cover_image}
                  alt={novel.title}
                  style={{
                    width: 120,
                    height: 170,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              )}
              <div style={{ textAlign: "left" }}>
                <Title level={2} style={{ textAlign: "left" }}>
                  {novel.title}
                </Title>
                <Text
                  type="secondary"
                  style={{ display: "block", textAlign: "left" }}
                >
                  by {novel.author}
                </Text>
                <Paragraph type="secondary" style={{ textAlign: "left" }}>
                  {novel.genre}
                </Paragraph>
                <div style={{ position: "relative" }}>
                  <Paragraph
                    style={{
                      textAlign: "left",
                      display: "-webkit-box",
                      WebkitLineClamp: descExpanded ? "none" : 5,
                      WebkitBoxOrient: "vertical",
                      overflow: descExpanded ? "visible" : "hidden",
                      whiteSpace: descExpanded ? "normal" : "initial",
                      transition: "all 0.2s",
                      maxHeight: descExpanded ? "none" : 120,
                    }}
                  >
                    {novel.description}
                  </Paragraph>
                  {novel.description &&
                    novel.description.split(" ").length > 30 && (
                      <Button
                        type="link"
                        style={{
                          padding: 0,
                          position: "absolute",
                          right: 0,
                        }}
                        onClick={() => setDescExpanded((prev) => !prev)}
                      >
                        {descExpanded ? "Thu gọn" : "Đọc thêm"}
                      </Button>
                    )}
                </div>
              </div>
            </div>
          </Card>
        )}
        <Title level={3} style={{ marginBottom: 16 }}>
          Danh sách chương
        </Title>
        {chaptersData && (
          <>
            <div
              style={{
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                id="selectAllChapters"
                style={{ marginRight: 8 }}
              />
              <label
                htmlFor="selectAllChapters"
                style={{
                  marginRight: 16,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                Chọn tất cả
              </label>
              <Button
                type="primary"
                disabled={selectedChapters.length === 0}
                onClick={handleDownloadSelected}
              >
                Tải về các chương đã chọn
              </Button>
            </div>
            <List
              grid={{ gutter: 12, xs: 1, sm: 2, md: 3, lg: 4 }}
              dataSource={chaptersData.chapters}
              renderItem={(chapter) => {
                const isDownloaded = downloadedUrls.includes(chapter.url);
                return (
                  <List.Item>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: isDownloaded ? "#e6f4ff" : undefined,
                        borderRadius: 6,
                        padding: isDownloaded ? "4px 8px" : undefined,
                        transition: "background 0.2s",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedChapters.includes(chapter.url)}
                        onChange={() => handleChapterSelect(chapter.url)}
                        id={`chapter-${chapter.url}`}
                        style={{ marginRight: 8 }}
                        disabled={isDownloaded}
                      />
                      <Button
                        block
                        type="default"
                        onClick={() =>
                          navigate(
                            `/chapter?url=${encodeURIComponent(chapter.url)}`
                          )
                        }
                        style={{
                          textAlign: "left",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          flex: 1,
                          background: isDownloaded ? "#e6f4ff" : undefined,
                          color: isDownloaded ? "#1677ff" : undefined,
                          borderColor: isDownloaded ? "#91caff" : undefined,
                          fontWeight: isDownloaded ? 600 : undefined,
                        }}
                      >
                        {chapter.title}
                      </Button>
                    </div>
                  </List.Item>
                );
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 24,
              }}
            >
              {/* <Pagination
                current={page}
                total={chaptersData.total}
                pageSize={limit}
                onChange={setPage}
                showSizeChanger={false}
              /> */}
            </div>
          </>
        )}
      </div>
      <ScrollToTopButton />
      <Footer />
      <Modal
        open={downloadModal.open}
        footer={null}
        closable={false}
        maskClosable={false}
        centered
        width={400}
        bodyStyle={{ textAlign: "center", padding: 32 }}
        style={{ zIndex: 2000 }}
      >
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 16 }}>
          Đang download, để yên đi đừng sờ vào!
        </div>
        <div style={{ marginBottom: 12, fontSize: 15 }}>
          {downloadModal.current > 0 && downloadModal.total > 0
            ? `Đang tải chương ${downloadModal.current} / ${downloadModal.total}`
            : null}
        </div>
        <Progress
          percent={downloadModal.percent}
          status={downloadModal.percent < 100 ? "active" : "success"}
        />
      </Modal>
    </>
  );
};

export default NovelDetailPage;
