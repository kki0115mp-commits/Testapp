export interface Difference {
  id: string;
  xPercent: number;
  yPercent: number;
  radiusPercent: number;
}

export interface LevelData {
  id: number;
  originalImage: string;
  modifiedImage: string;
  differences: Difference[];
}

export const gameData: LevelData[] = [
  {
    id: 1,
    originalImage: "/fairytale.png",
    // We generated a slightly modified version of the image using AI image editing.
    modifiedImage: "/fairytale_modified.png",
    differences: [
      { id: "diff-1", xPercent: 28.5, yPercent: 45.0, radiusPercent: 15 },
      { id: "diff-2", xPercent: 70.2, yPercent: 62.1, radiusPercent: 15 },
      { id: "diff-3", xPercent: 55.0, yPercent: 25.5, radiusPercent: 15 },
    ]
  },
  {
    id: 2,
    originalImage: "https://picsum.photos/seed/level2/800/600",
    modifiedImage: "https://picsum.photos/seed/level2/800/600",
    differences: [
      { id: "diff-1", xPercent: 30.0, yPercent: 30.0, radiusPercent: 15 },
      { id: "diff-2", xPercent: 60.0, yPercent: 60.0, radiusPercent: 15 },
      { id: "diff-3", xPercent: 40.0, yPercent: 80.0, radiusPercent: 15 },
    ]
  }
];
