type IllustrationProps = { name: string; className?: string };

function SvgFrame({ children, className, label }: { children: React.ReactNode; className?: string; label: string }) {
  return <svg viewBox="0 0 160 120" role="img" aria-label={label} className={className}>{children}</svg>;
}

export function TwoDBackground({ name, className }: IllustrationProps) {
  const base = <><rect width="160" height="120" fill="#f3eee7" /><rect y="84" width="160" height="36" fill="#dfd4c6" /></>;
  if (name === "서울 카페") return <SvgFrame label="Seoul cafe 2D background" className={className}>{base}<rect x="13" y="15" width="57" height="55" rx="3" fill="#c6b49f"/><rect x="18" y="20" width="47" height="45" fill="#e7d3b6"/><path d="M18 48h47M42 20v45" stroke="#faf6ef" strokeWidth="2"/><path d="M105 90v-25c0-9 22-9 22 0v25M98 68h36" stroke="#826b57" strokeWidth="4" fill="none"/><ellipse cx="116" cy="65" rx="27" ry="5" fill="#b48f6d"/><path d="M78 86h70" stroke="#b48f6d" strokeWidth="3"/></SvgFrame>;
  if (name === "갤러리") return <SvgFrame label="Art gallery 2D background" className={className}>{base}<rect width="160" height="84" fill="#fbfaf7"/><path d="M0 84 160 60v24H0Z" fill="#ded8cf"/><rect x="48" y="14" width="64" height="38" rx="2" fill="#bba58c"/><path d="M55 43 76 20l14 24 16-17" stroke="#594a3f" strokeWidth="4" fill="none"/><rect x="18" y="55" width="18" height="27" fill="#dac8b5"/><ellipse cx="27" cy="53" rx="12" ry="5" fill="#88735d"/><rect x="126" y="61" width="10" height="22" fill="#ccb9a2"/></SvgFrame>;
  if (name === "한강 공원") return <SvgFrame label="Han River park 2D background" className={className}>{base}<rect width="160" height="65" fill="#f2d9bf"/><circle cx="124" cy="26" r="12" fill="#e3a871"/><path d="M0 64c25-14 47-5 66-13 25-11 43 8 94-4v37H0Z" fill="#9fbfc2"/><path d="M0 79c26-9 50-3 80 2 24 4 43-5 80-1v40H0Z" fill="#789ba2"/><path d="M17 102c24-19 51-23 77-22" stroke="#d3c09b" strokeWidth="8" fill="none"/><path d="M16 70v-22m10 22v-17m9 17V47" stroke="#788f6d" strokeWidth="3"/></SvgFrame>;
  if (name === "성수동 거리") return <SvgFrame label="Seongsu street 2D background" className={className}>{base}<rect width="160" height="75" fill="#ded0c1"/><path d="M0 75 160 56v27H0Z" fill="#c0b2a3"/><path d="M10 15h49v58H10Zm8 7h9v10h-9Zm18 0h9v10h-9Zm-18 20h9v10h-9Zm18 0h9v10h-9Z" fill="#ad8065"/><path d="M73 9h65v64H73Z" fill="#d8cbbd"/><path d="M78 24h54v10H78Z" fill="#9d8a78"/><path d="M145 72V42" stroke="#5d7257" strokeWidth="4"/><circle cx="145" cy="34" r="13" fill="#8ea081"/><path d="M72 102 100 74" stroke="#ede4d8" strokeWidth="5"/></SvgFrame>;
  if (name === "도쿄 거리") return <SvgFrame label="Tokyo street 2D background" className={className}>{base}<rect width="160" height="76" fill="#273345"/><path d="M0 76h160v44H0Z" fill="#526172"/><path d="M8 12h46v64H8Zm54 15h39v49H62Zm47-19h41v68h-41Z" fill="#3b4657"/><path d="M15 22h32M68 37h27m20-16h27" stroke="#e5a58c" strokeWidth="4"/><circle cx="33" cy="44" r="5" fill="#d5b26e"/><circle cx="130" cy="35" r="5" fill="#d5b26e"/><path d="M50 120 85 76m-1 44 27-44" stroke="#cbb5a8" strokeWidth="3"/></SvgFrame>;
  if (name === "파리 카페") return <SvgFrame label="Paris cafe 2D background" className={className}>{base}<rect width="160" height="76" fill="#e8dfd3"/><path d="M0 28h160v15H0Z" fill="#b67e70"/><path d="M10 28h17v15H10Zm34 0h17v15H44Zm34 0h17v15H78Zm34 0h17v15h-17Zm34 0h14v15h-14Z" fill="#f7ead8"/><path d="M14 76v-41m28 41v-41m70 41v-41m28 41v-41" stroke="#c9b79f" strokeWidth="4"/><ellipse cx="77" cy="81" rx="22" ry="5" fill="#a58068"/><path d="M76 83v25m-18 0h36" stroke="#9a7d67" strokeWidth="3"/></SvgFrame>;
  if (name === "럭셔리 호텔 로비") return <SvgFrame label="Luxury hotel lobby 2D background" className={className}>{base}<rect width="160" height="80" fill="#d8c8b6"/><path d="M20 80V25c0-21 34-21 34 0v55m52 0V25c0-21 34-21 34 0v55" fill="#c1a98c"/><path d="M28 44h18m68 0h18" stroke="#f3dfb1" strokeWidth="3"/><rect x="50" y="62" width="60" height="20" rx="10" fill="#a67955"/><ellipse cx="80" cy="101" rx="50" ry="15" fill="#b9a284"/><path d="M76 61v-22m8 22V32" stroke="#766454" strokeWidth="3"/></SvgFrame>;
  if (name === "꽃집 앞") return <SvgFrame label="Flower shop 2D background" className={className}>{base}<rect width="160" height="74" fill="#d8d6c5"/><path d="M0 20h160v14H0Z" fill="#e4b8a8"/><path d="M8 20h17v14H8Zm34 0h17v14H42Zm34 0h17v14H76Zm34 0h17v14h-17Zm34 0h17v14h-17Z" fill="#f5ead5"/><path d="M8 76h35V48H8Zm109 0h35V48h-35Z" fill="#b79470"/><g fill="#d28d93"><circle cx="17" cy="54" r="6"/><circle cx="28" cy="57" r="7"/><circle cx="37" cy="53" r="5"/><circle cx="128" cy="55" r="6"/><circle cx="139" cy="57" r="7"/></g><path d="M80 120 83 74" stroke="#d5bda3" strokeWidth="6"/></SvgFrame>;
  if (name === "미니멀 스튜디오") return <SvgFrame label="Minimal fashion studio 2D background" className={className}>{base}<rect width="160" height="84" fill="#faf7f1"/><path d="M0 84c44-8 104-8 160 0v36H0Z" fill="#e7dfd3"/><ellipse cx="122" cy="82" rx="24" ry="8" fill="#cebca5"/><rect x="104" y="55" width="36" height="27" rx="2" fill="#dccdbb"/><path d="M24 84V53m0 0c-12-13 9-22 7-31m-7 31c12-10 0-22 10-30" stroke="#84917b" strokeWidth="3" fill="none"/><path d="M0 28c38 16 78 9 110-13" stroke="#eee6da" strokeWidth="18" fill="none"/></SvgFrame>;
  return <SvgFrame label="Jeju seaside 2D background" className={className}>{base}<rect width="160" height="62" fill="#d7e0db"/><path d="M0 62c30-12 61-8 88-14 35-8 46 7 72 0v23H0Z" fill="#82b5b9"/><path d="M0 85c43-10 77 5 160-5v40H0Z" fill="#d4c3a5"/><path d="M5 99c28-14 41-19 73-17" stroke="#5e5c55" strokeWidth="8" fill="none"/><path d="M118 87v-28m8 28V62m9 25V55" stroke="#879a7f" strokeWidth="3"/></SvgFrame>;
}

export function TwoDPose({ name, className }: IllustrationProps) {
  const variant = ({ "한 손 주머니": "pocket", "살짝 옆으로": "side", 정면: "front", "걷는 포즈": "walking", 팔짱: "crossed", "앉은 포즈": "seated", "Natural Standing": "natural", "Front Model Pose": "front", "Side Pose": "side", Walking: "walking", "Hand in Pocket": "pocket", "Elegant Fashion Pose": "elegant" } as Record<string, string>)[name] ?? "natural";
  const common = { fill: "#34302d", stroke: "#34302d", strokeWidth: 3, strokeLinecap: "round" as const };
  const head = <circle cx="50" cy="22" r="10" fill="#b77c66" />;
  const hair = <path d="M41 22c0-12 18-15 19 1l-2 8H42Z" fill="#292624" />;
  const torso = <path d="M39 35c6-4 16-4 22 0l4 30H35Z" fill="#eee7dc" />;
  const legs = <path d="M39 65 35 110m22-45 7 45" {...common} fill="none" />;
  const feet = <path d="M29 112h13m21 0h13" {...common} fill="none" />;
  const arms = (left: string, right: string) => <><path d={left} {...common} fill="none"/><path d={right} {...common} fill="none"/></>;
  let limbs = arms("M39 39 27 65", "M61 39 73 65");
  if (variant === "front") limbs = arms("M39 40 45 59", "M61 40 55 59");
  if (variant === "side") limbs = arms("M43 40 33 67", "M58 42 66 62");
  if (variant === "walking") limbs = arms("M39 40 24 59", "M61 40 76 50");
  if (variant === "pocket") limbs = arms("M39 40 45 64", "M61 40 72 65");
  if (variant === "crossed") limbs = arms("M39 40 58 54", "M61 40 42 54");
  if (variant === "elegant") limbs = arms("M39 40 49 32", "M61 40 74 65");
  const walkingLegs = variant === "walking" ? <><path d="M42 65 26 106" {...common} fill="none"/><path d="M55 65 69 99" {...common} fill="none"/><path d="M21 108h14m29-7h15" {...common} fill="none"/></> : legs;
  const seated = variant === "seated";
  const sideShift = variant === "side" ? "rotate(-8 50 65)" : variant === "elegant" ? "rotate(6 50 65)" : "";
  return <svg viewBox="0 0 100 130" role="img" aria-label={`${name} 2D pose illustration`} className={className}><ellipse cx="50" cy="117" rx="26" ry="5" fill="#d8cec1"/>{seated && <path d="M28 78h44v6H28Zm5 6v28m31-28v28" stroke="#9a7e65" strokeWidth="4" fill="none"/>}<g transform={seated ? "translate(0 9) rotate(-18 50 65)" : sideShift}>{head}{hair}{torso}{limbs}{walkingLegs}{feet}</g></svg>;
}
