export default function PlaceholderImage({
  width = 800,
  height = 600,
  color = "3498db",
  text = "Image",
}: {
  width?: number;
  height?: number;
  color?: string;
  text?: string;
}) {
  return (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
    >
      <rect width="100%" height="100%" fill={`#${color}`} />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="24"
        fontFamily="Arial, sans-serif"
      >
        {text}
      </text>
    </svg>
  );
}
