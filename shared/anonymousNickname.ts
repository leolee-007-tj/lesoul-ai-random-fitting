export type NicknameLocale = "en" | "ko" | "zh";

const words: Record<NicknameLocale, { adjectives: readonly string[]; nouns: readonly string[] }> = {
  en: { adjectives: ["Brave", "Gentle", "Bright", "Calm", "Joyful", "Cozy", "Witty", "Shining", "Thoughtful", "Playful", "Clever", "Warm"], nouns: ["Tin", "Cloud", "Star", "Umbrella", "Teacup", "Bookmark", "Button", "Whale", "Lantern", "Rabbit", "Butterfly", "Wave"] },
  ko: { adjectives: ["용감한", "다정한", "반짝이는", "고요한", "즐거운", "포근한", "재치있는", "빛나는", "사려깊은", "유쾌한", "영리한", "따뜻한"], nouns: ["깡통", "구름", "별", "우산", "찻잔", "책갈피", "단추", "고래", "등불", "토끼", "나비", "파도"] },
  zh: { adjectives: ["勇敢的", "温柔的", "闪亮的", "安静的", "快乐的", "温暖的", "机灵的", "明亮的", "体贴的", "俏皮的", "聪明的", "暖心的"], nouns: ["小铁罐", "云朵", "星星", "雨伞", "茶杯", "书签", "纽扣", "鲸鱼", "灯笼", "兔子", "蝴蝶", "海浪"] },
};

function stableHash(value: string, salt: number) {
  let hash = 2166136261 ^ salt;
  for (let index = 0; index < value.length; index += 1) { hash ^= value.charCodeAt(index); hash = Math.imul(hash, 16777619); }
  return hash >>> 0;
}

export function anonymousNickname(identity: string, locale: NicknameLocale) {
  const source = identity.trim() || "anonymous";
  const dictionary = words[locale];
  return `${dictionary.adjectives[stableHash(source, 17) % dictionary.adjectives.length]} ${dictionary.nouns[stableHash(source, 71) % dictionary.nouns.length]}`;
}
