import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
//import logo from "../logo.svg";
import logo from "../logo.jpg";

const Header = () => {
  const navigate = useNavigate();
  return (
    <header
      style={{
        width: "100%",
        background: "#fff",
        borderBottom: "1px solid #eee",
        marginBottom: 32,
        padding: "12px 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginLeft: 32,
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        <img src={logo} alt="Logo" style={{ height: 40, marginRight: 12 }} />
        <span
          style={{
            fontWeight: 700,
            fontSize: 24,
            color: "#222",
            fontFamily: "Arial, sans-serif",
          }}
        >
          Truyện 3xu
        </span>
      </div>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginRight: 32,
        }}
      >
        {/* <Button
          type="link"
          style={{ fontWeight: 500, fontSize: 16, color: "#222" }}
          onClick={() => navigate("/")}
        >
          Trang chủ
        </Button> */}
        <Button
          type="link"
          style={{ fontWeight: 500, fontSize: 16, color: "#222" }}
          onClick={() => navigate("/library")}
        >
          Thư viện
        </Button>
      </nav>
    </header>
  );
};

export default Header;
