export function TinyKitLogo({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt=""
      width={size}
      height={size}
      className={className}
      draggable={false}
    />
  );
}
