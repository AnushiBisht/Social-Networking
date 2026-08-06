const PALETTE = ["#d9722f", "#3d6b8a", "#5b7a4f", "#8a5a8a", "#a3492f", "#2f6b5e"];

function hashString(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function colorForId(id) {
  return PALETTE[hashString(id) % PALETTE.length];
}

export default function NodeAvatar({ id, name, size = 36 }) {
  const label = (name || id || "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className="node-avatar"
      style={{
        width: size,
        height: size,
        background: colorForId(id || name || ""),
        fontSize: Math.max(11, size * 0.4),
      }}
    >
      {label}
    </div>
  );
}
