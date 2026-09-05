import { isNewArrival } from "./productAvailability";

export function shuffleWithinNewArrivalGroups<T extends { isNew?: number | boolean | null }>(items: T[], random: () => number = Math.random) {
  const shuffle = (group: T[]) => {
    const result = [...group];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(random() * (index + 1));
      [result[index], result[swap]] = [result[swap], result[index]];
    }
    return result;
  };
  const newArrivals = items.filter((item) => isNewArrival(item));
  const currentProducts = items.filter((item) => !isNewArrival(item));
  return [...shuffle(newArrivals), ...shuffle(currentProducts)];
}
