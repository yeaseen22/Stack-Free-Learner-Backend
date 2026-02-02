export const getAllProfileLevels = (totalMark: number) => {
  return [
    { profileType: "Apprentice", isUnlock: totalMark >= 300 },
    { profileType: "Adventurer", isUnlock: totalMark >= 600 },
    { profileType: "Elite", isUnlock: totalMark >= 900 },
    { profileType: "Grandmaster", isUnlock: totalMark >= 1200 },
  ];
};
