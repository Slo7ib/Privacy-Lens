import type { CollectedCategory } from "@/shared/logic/dataCategories";

export type PrivacyRating = "A" | "B" | "C" | "D" | "F";

export interface RatingResult {
  rating: PrivacyRating;
  score: number;
  description: string;
}

// Define sensitivity weights for different data types
const SENSITIVITY_WEIGHTS: Record<string, number> = {
  // High sensitivity - heavy penalty
  "Payment Information": 15,
  "Biometric Data": 15,
  "Account Credentials": 12,
  "Contact List": 12,
  "Calendar Access": 12,

  // Medium sensitivity - medium penalty
  "Personal Information": 8,
  "Phone Number": 7,
  "Email": 6,
  "Location Data": 8,
  "User-Submitted Content": 7,
  "Customer Support Communications": 5,

  // Lower sensitivity - light penalty
  "IP Address": 4,
  "Device Type": 3,
  "Cookie usage": 4,
  "Links clicked": 3,
  "Pages visited": 3,
  "Search History": 4,
  "Analytics & Usage Data": 3,
  "Advertising Identifiers": 5,
  "Third-Party Data Sharing": 10, // Extra penalty for sharing
  "Data Retention": 2,
};

const RATING_THRESHOLDS = {
  A: 90,
  B: 80,
  C: 70,
  D: 60,
  F: 0,
};

const RATING_DESCRIPTIONS: Record<PrivacyRating, string> = {
  A: "Excellent privacy practices with minimal data collection",
  B: "Good privacy practices with reasonable data collection",
  C: "Moderate privacy concerns with significant data collection",
  D: "Poor privacy practices with extensive data collection",
  F: "Very poor privacy practices with excessive data collection",
};

export function calculatePrivacyRating(
  categories: CollectedCategory[],
  sharesWithThirdParties?: boolean,
): RatingResult {
  // Start with a perfect score of 100
  let score = 100;

  // Calculate penalties based on collected data
  const collectedItems = categories.filter((cat) => cat.collected);

  for (const item of collectedItems) {
    const penalty = SENSITIVITY_WEIGHTS[item.element] || 5; // Default penalty for unknown items
    score -= penalty;
  }

  // Additional penalty if third-party sharing is detected from usage/sharing analysis
  // (This is separate from the "Third-Party Data Sharing" data collection item)
  if (sharesWithThirdParties) {
    score -= 8;
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, Math.min(100, score));

  // Determine rating based on score
  let rating: PrivacyRating;
  if (score >= RATING_THRESHOLDS.A) {
    rating = "A";
  } else if (score >= RATING_THRESHOLDS.B) {
    rating = "B";
  } else if (score >= RATING_THRESHOLDS.C) {
    rating = "C";
  } else if (score >= RATING_THRESHOLDS.D) {
    rating = "D";
  } else {
    rating = "F";
  }

  return {
    rating,
    score: Math.round(score),
    description: RATING_DESCRIPTIONS[rating],
  };
}

