// a constant list of sections as types to avoid spelling mistakes
export const sections = [
  "Personal Identifiers",
  "Online Activity",
  "Device Data",
] as const;

export type SectionName = (typeof sections)[number];
