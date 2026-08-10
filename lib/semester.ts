export type SemesterName = "Spring" | "Summer" | "Fall";

export interface SemesterInfo {
  semester: SemesterName;
  year: number;
  label: string;
}

/**
 * BRAC University semester mapping:
 *   Spring — January to April
 *   Summer — May to August
 *   Fall   — September to December
 */
export function getCurrentSemester(
  date: Date = new Date(),
): SemesterInfo {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  let semester: SemesterName;

  if (month >= 1 && month <= 4) {
    semester = "Spring";
  } else if (month >= 5 && month <= 8) {
    semester = "Summer";
  } else {
    semester = "Fall";
  }

  return {
    semester,
    year,
    label: `${semester} ${year}`,
  };
}