export default function LabelOutlined({
  children,
  vertical = "top",
  horizontal = "right",
  borderColor = "#888",
  borderRadius = "5px",
  label = "label",
  style = { width: "fit-content", height: "fit-content", position: "relative" },
}) {
  return (
    <div style={{ ...style, position: "relative" }}>
      <div style={{ position: "relative", padding: "1rem", zIndex: "1" }}>
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          display: "flex",
        }}
      >
        <div
          style={{
            position: "relative",
            borderTop: `1px solid ${borderColor}`,
            borderBottom: `1px solid ${borderColor}`,
            borderLeft: `1px solid ${borderColor}`,
            borderRadius: `${borderRadius} 0 0 ${borderRadius}`,
            width: horizontal == "left" ? "10px" : "100%",
          }}
        />
        <div
          style={{
            position: "relative",
            borderBottom: vertical == "top" ? `1px solid ${borderColor}` : null,
            borderTop: vertical == "bottom" ? `1px solid ${borderColor}` : null,
            paddingLeft: "5px",
            paddingRight: "5px",
            width: "maxContent",
            display: "flex",
            flexDirection: "column",
            justifyContent: vertical == "top" ? "start" : "end",
          }}
        >
          <div
            style={{
              position: "relative",
              transform:
                vertical == "top" ? "translate(0, -50%)" : "translate(0, 50%)",
              fontSize: "0.8rem",
              color: `${borderColor}`,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </div>
        </div>
        <div
          style={{
            position: "relative",
            borderTop: `1px solid ${borderColor}`,
            borderRight: `1px solid ${borderColor}`,
            borderBottom: `1px solid ${borderColor}`,
            borderRadius: `0 ${borderRadius} ${borderRadius} 0`,
            width: horizontal == "right" ? "10px" : "100%",
          }}
        />
      </div>
    </div>
  );
}
