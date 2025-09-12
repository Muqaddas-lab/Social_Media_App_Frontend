import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { AiFillHeart } from "react-icons/ai";

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.top}>
        <p>© 2025 SocioSphere</p>
        <p>
          Made with <AiFillHeart style={{ color: "red", margin: "0 5px" }} /> by{" "}
          <span style={{ fontWeight: "600" }}>Muqaddas</span>
        </p>
      </div>

      <div style={styles.icons}>
        <a href="https://github.com/" target="_blank" rel="noreferrer">
          <FaGithub />
        </a>
        <a href="https://linkedin.com/" target="_blank" rel="noreferrer">
          <FaLinkedin />
        </a>
        <a href="mailto:example@email.com">
          <FaEnvelope />
        </a>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    position: "fixed",
    bottom: 0,
    width: "100%",
    background: "linear-gradient(90deg, #4e54c8, #8f94fb)",
    color: "white",
    textAlign: "center",
    padding: "12px 0",
    boxShadow: "0px -3px 10px rgba(0,0,0,0.2)",
    fontWeight: "500",
    fontSize: "14px",
  },
  top: {
    marginBottom: "6px",
  },
  icons: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    fontSize: "18px",
  },
};

export default Footer;
