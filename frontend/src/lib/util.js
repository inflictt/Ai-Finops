// hex (#RRGGBB) + alpha -> rgba() string, for tinted backgrounds/borders
export const tint = (hex, a) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}
