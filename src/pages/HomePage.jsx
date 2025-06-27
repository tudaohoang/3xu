import React, { useState, useEffect } from "react";
import { Typography, Input, List, Card, Pagination, Spin, Alert } from "antd";
import { fetchNovels } from "../api/novelApi";
import { useAsync } from "../hooks/useAsync";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const HomePage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showLoading, setShowLoading] = useState(false);
  const limit = 20;
  const navigate = useNavigate();

  const { data, loading, error } = useAsync(
    () => fetchNovels({ title: search, page, limit }),
    [search, page]
  );

  // Show loading icon on top when searching or paging
  useEffect(() => {
    if (loading) setShowLoading(true);
    else setTimeout(() => setShowLoading(false), 300); // smooth UX
  }, [loading]);

  function timeAgoVN(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now - date) / 1000);
    console.log("timeAgoVN", dateString, diff);
    if (isNaN(diff)) return "";
    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} tháng trước`;
    return `${Math.floor(diff / 31536000)} năm trước`;
  }

  return (
    <>
      <Header />
      {showLoading && (
        <div
          style={{
            position: "fixed",
            top: 70,
            left: 0,
            width: "100%",
            zIndex: 2000,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Spin size="large" style={{ margin: 16 }} />
        </div>
      )}
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: 24,
          filter: showLoading ? "blur(2.5px)" : "none",
          transition: "filter 0.2s",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Input.Search
            placeholder="Tìm kiếm truyện..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 550 }}
            allowClear
          />
        </div>
        {/* Add Pagination above the results */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <Pagination
            current={page}
            total={data ? data.total : 0}
            pageSize={limit}
            onChange={setPage}
            showSizeChanger={false}
          />
        </div>
        {error && (
          <Alert
            type="error"
            message={error.message}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        {data && (
          <>
            <Text
              type="secondary"
              style={{
                marginBottom: 16,
                display: "block",
              }}
            >
              Hiển thị {data.from}-{data.to} of {data.total} kết quả
            </Text>
            <List
              grid={{
                gutter: 16,
                xs: 1,
                sm: 2,
                md: 2,
                lg: 2,
                xl: 3,
                xxl: 3,
              }}
              dataSource={data.novels}
              renderItem={(novel) => (
                <List.Item style={{ display: "flex", alignItems: "stretch" }}>
                  <Card
                    hoverable
                    style={{
                      cursor: "pointer",
                      minHeight: 140,
                      height: 180,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                    onClick={() => navigate(`/novel/${novel.id}`)}
                    bodyStyle={{ padding: 0, height: "100%" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        height: "100%",
                      }}
                    >
                      {novel.cover_image && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            margin: 16,
                          }}
                        >
                          <img
                            alt={novel.title}
                            src={novel.cover_image}
                            style={{
                              width: 70,
                              height: 100,
                              objectFit: "cover",
                              borderRadius: 6,
                            }}
                          />
                          <Text
                            type="secondary"
                            style={{ fontSize: 12, marginTop: 8 }}
                          >
                            {timeAgoVN(novel.createdAt)}
                          </Text>
                        </div>
                      )}
                      <div
                        style={{
                          flex: 1,
                          padding: 16,
                          paddingLeft: 0,
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          strong
                          style={{
                            fontSize: 18,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "normal",
                            marginBottom: 2,
                            textAlign: "left",
                          }}
                        >
                          {novel.title}
                        </Text>
                        <Text
                          type="secondary"
                          style={{
                            display: "block",
                            marginBottom: 4,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            textAlign: "left",
                          }}
                        >
                          {novel.author}
                        </Text>
                        <div
                          style={{
                            minHeight: 40,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            marginTop: 2,
                            textAlign: "left",
                          }}
                        >
                          {novel.description}
                        </div>
                      </div>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 24,
              }}
            >
              <Pagination
                current={page}
                total={data.total}
                pageSize={limit}
                onChange={setPage}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default HomePage;
