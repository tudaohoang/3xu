import React, { useState } from "react";
import { Typography, List, Card, Modal } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getMany, keys, del } from "idb-keyval";
import LZString from "lz-string";

const { Title, Text } = Typography;

const Library = () => {
  const [novels, setNovels] = useState([]);
  const [reading, setReading] = useState(null); // {novel, chapter}
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedNovels, setExpandedNovels] = useState({});
  const [storageInfo, setStorageInfo] = useState({ used: 0, quota: 0 });
  const [deletingNovel, setDeletingNovel] = useState(null);

  React.useEffect(() => {
    async function fetchAllNovels() {
      const allKeys = await keys();
      // Only get keys that match our pattern
      const novelKeys = allKeys.filter(
        (k) => typeof k === "string" && k.includes("__")
      );
      const allNovels = await getMany(novelKeys);
      setNovels(
        allNovels.filter(Boolean).map((novel) => ({
          ...novel,
          chapters: (novel.chapters || []).map((c) => ({
            ...c,
            // Decompress content for display
            content: c.content ? LZString.decompress(c.content) : "",
          })),
        }))
      );
      // Calculate storage usage
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        setStorageInfo({
          used: estimate.usage || 0,
          quota: estimate.quota || 0,
        });
      }
    }
    fetchAllNovels();
  }, []);

  const handleReadChapter = (novel, chapter) => {
    // Decompress content if compressed
    let content = chapter.content;
    if (
      typeof content === "string" &&
      content.length > 0 &&
      content.length < 100000 &&
      content.indexOf("<") === -1
    ) {
      try {
        content = LZString.decompress(content) || content;
      } catch (e) {}
    }
    setReading({ novel, chapter: { ...chapter, content } });
    // Show as full page overlay
    document.body.style.overflow = "hidden";
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    document.body.style.overflow = "";
  };

  const handleRemoveNovel = (novel) => {
    setDeletingNovel(novel);
  };

  const confirmDeleteNovel = async () => {
    if (!deletingNovel) return;
    const key = `${deletingNovel.title}__${deletingNovel.author}`;
    await del(key);
    setNovels((prev) =>
      prev.filter(
        (n) =>
          n.title !== deletingNovel.title || n.author !== deletingNovel.author
      )
    );
    setDeletingNovel(null);
  };

  const cancelDeleteNovel = () => {
    setDeletingNovel(null);
  };

  return (
    <>
      <Header />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <Title level={2}>Thư viện đã tải về</Title>
        <div style={{ marginBottom: 25, marginTop: 25 }}>
          <b>Lưu trữ đã dùng:</b>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 4,
            }}
          >
            <div
              style={{
                flex: 1,
                background: "#eee",
                borderRadius: 8,
                height: 16,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: storageInfo.quota
                    ? `${Math.round(
                        (storageInfo.used / storageInfo.quota) * 100
                      )}%`
                    : "0%",
                  background: "#1677ff",
                  height: "100%",
                  transition: "width 0.3s",
                }}
              />
            </div>
            <span style={{ minWidth: 120, fontSize: 13 }}>
              {storageInfo.used && storageInfo.quota
                ? `${(storageInfo.used / 1024 / 1024).toFixed(2)}MB / ${(
                    storageInfo.quota /
                    1024 /
                    1024
                  ).toFixed(2)}MB`
                : "Đang tính toán..."}
            </span>
          </div>
        </div>
        {novels.length === 0 ? (
          <Text type="secondary">Chưa có truyện nào được tải về.</Text>
        ) : (
          <List
            dataSource={novels}
            renderItem={(novel) => {
              const expanded = expandedNovels[novel.title] || false;
              const chaptersToShow = expanded
                ? novel.chapters
                : novel.chapters.slice(0, 10);
              return (
                <List.Item>
                  <Card
                    title={
                      <span style={{ textAlign: "left", display: "block" }}>
                        {novel.title}
                        <DeleteOutlined
                          style={{
                            color: "#ff4d4f",
                            float: "right",
                            fontSize: 20,
                            cursor: "pointer",
                          }}
                          title="Xóa truyện đã tải"
                          onClick={() => handleRemoveNovel(novel)}
                        />
                      </span>
                    }
                    style={{ width: "100%" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 16,
                      }}
                    >
                      {novel.cover_image && (
                        <img
                          src={novel.cover_image}
                          alt={novel.title}
                          style={{
                            width: 120,
                            height: 160,
                            objectFit: "cover",
                            borderRadius: 6,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                          }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <List
                          size="small"
                          header={<b>Danh sách chương đã tải</b>}
                          dataSource={chaptersToShow}
                          renderItem={(chapter) => (
                            <List.Item
                              style={{
                                cursor: "pointer",
                                fontSize: expanded ? 13 : 16,
                                color: expanded ? "#666" : undefined,
                                padding: expanded ? "2px 0" : undefined,
                              }}
                              onClick={() => handleReadChapter(novel, chapter)}
                            >
                              {chapter.title}
                            </List.Item>
                          )}
                        />
                        {novel.chapters.length > 10 && (
                          <div style={{ textAlign: "center", marginTop: 8 }}>
                            <button
                              type="button"
                              style={{
                                cursor: "pointer",
                                color: "#1677ff",
                                fontWeight: 500,
                                background: "none",
                                border: "none",
                                padding: 0,
                                fontSize: 13,
                              }}
                              onClick={() =>
                                setExpandedNovels((prev) => ({
                                  ...prev,
                                  [novel.title]: !expanded,
                                }))
                              }
                            >
                              {expanded
                                ? "Thu gọn"
                                : `Xem thêm (${
                                    novel.chapters.length - 10
                                  }) chương...`}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </List.Item>
              );
            }}
          />
        )}
        <Modal
          open={modalOpen}
          onCancel={handleCloseModal}
          footer={null}
          width="100%"
          style={{
            top: 0,
            left: 0,
            margin: 0,
            padding: 0,
            maxWidth: "100vw",
          }}
          bodyStyle={{
            height: "100vh",
            maxHeight: "100vh",
            overflowY: "auto",
            padding: 32,
            marginTop: 0,
          }}
          title={reading ? reading.chapter.title : ""}
          centered
          closable={true}
          maskClosable={true}
          className="fullpage-modal"
        >
          <div>
            <Text strong style={{ fontSize: 20 }}>
              {reading ? reading.novel.title : ""}
            </Text>
            <div style={{ margin: "24px 0", fontSize: 18 }}>
              {reading && (
                <div
                  dangerouslySetInnerHTML={{ __html: reading.chapter.content }}
                  style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}
                />
              )}
            </div>
          </div>
        </Modal>
        <Modal
          open={!!deletingNovel}
          onOk={confirmDeleteNovel}
          onCancel={cancelDeleteNovel}
          okText="Xóa"
          okType="danger"
          cancelText="Hủy"
          centered
          title="Xác nhận xóa truyện?"
        >
          {deletingNovel && (
            <div>
              Bạn có chắc muốn xóa truyện "{deletingNovel.title}" khỏi thư viện?
              Tất cả các chương đã tải sẽ bị xóa vĩnh viễn.
            </div>
          )}
        </Modal>
      </div>
      <Footer />
    </>
  );
};

export default Library;
