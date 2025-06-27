import React from "react";
import { useLocation } from "react-router-dom";
import { Typography, Spin, Alert } from "antd";
import { fetchChapterContent } from "../api/novelApi";
import { useAsync } from "../hooks/useAsync";
import Header from "../components/Header";
import Footer from "../components/Footer";

const { Title } = Typography;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ChapterPage = () => {
  const query = useQuery();
  const url = query.get("url");
  const { data, loading, error } = useAsync(
    () => (url ? fetchChapterContent(url) : Promise.resolve(null)),
    [url]
  );
  const [fontSize, setFontSize] = React.useState(18);

  const handleFontSizeChange = (delta) => {
    setFontSize((size) => Math.max(12, Math.min(48, size + delta)));
  };

  return (
    <>
      <Header />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <button
            onClick={() => handleFontSizeChange(-2)}
            style={{
              fontSize: 18,
              width: 32,
              height: 32,
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "#f7f7f7",
              cursor: "pointer",
            }}
            aria-label="Giảm cỡ chữ"
          >
            -
          </button>
          <button
            onClick={() => handleFontSizeChange(2)}
            style={{
              fontSize: 18,
              width: 32,
              height: 32,
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "#f7f7f7",
              cursor: "pointer",
            }}
            aria-label="Tăng cỡ chữ"
          >
            +
          </button>
        </div>
        {loading && <Spin style={{ display: "block", margin: "40px auto" }} />}
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
            <Title level={2} style={{ marginBottom: 24, textAlign: "left" }}>
              {data.title}
            </Title>
            <div
              style={{
                background: "#fff",
                borderRadius: 8,
                padding: 24,
                minHeight: 300,
                fontSize: fontSize,
                transition: "font-size 0.2s",
                textAlign: "left",
                lineHeight: 1.9,
              }}
              dangerouslySetInnerHTML={{ __html: data.content }}
            />
          </>
        )}
        {!url && (
          <div style={{ textAlign: "center" }}>No chapter URL provided.</div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ChapterPage;
