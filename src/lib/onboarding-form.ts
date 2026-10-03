export type FieldType = "text" | "textarea" | "number" | "date" | "yesno" | "select";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  hint?: string;
  options?: string[];
  /** yesno only: label for the follow-up shown (and stored as `${name}_detail`) when the answer is Yes. */
  detail?: string;
  /** yesno only: a Yes answer means the athlete needs medical clearance first. */
  clearance?: boolean;
};

export type Section = { id: string; title: string; intro?: string; fields: Field[] };

const SCALE = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export const ONBOARDING_SECTIONS: Section[] = [
  {
    id: "about",
    title: "About you",
    fields: [
      { name: "firstName", label: "First name", type: "text", required: true },
      { name: "lastName", label: "Last name", type: "text", required: true },
      { name: "phone", label: "Phone", type: "text", required: true },
      { name: "dateOfBirth", label: "Date of birth", type: "date", required: true },
      { name: "emergencyName", label: "Emergency contact name", type: "text", required: true },
      { name: "emergencyPhone", label: "Emergency contact phone", type: "text", required: true },
    ],
  },
  {
    id: "screening",
    title: "Health screening",
    intro: "These questions help keep your training safe. Please answer honestly.",
    fields: [
      {
        name: "heartCondition",
        label: "Has a doctor ever told you that you have a heart condition, or that you should only exercise under medical supervision?",
        type: "yesno",
        required: true,
        clearance: true,
        detail: "Please give details",
      },
      {
        name: "chestPain",
        label: "Do you get chest pain, dizziness, fainting, or unusual shortness of breath during or after exercise?",
        type: "yesno",
        required: true,
        clearance: true,
        detail: "Please give details",
      },
      {
        name: "ongoingCondition",
        label: "Do you have high blood pressure, diabetes, asthma, or any other ongoing medical condition?",
        type: "yesno",
        required: true,
        clearance: true,
        detail: "Please describe",
      },
      {
        name: "medication",
        label: "Are you currently taking any medication that could affect exercise, such as for heart rate or blood pressure?",
        type: "yesno",
        required: true,
        clearance: true,
        detail: "Which medication?",
      },
      {
        name: "currentInjury",
        label: "Do you have any current injuries or pain?",
        type: "yesno",
        required: true,
        detail: "Where, and for how long?",
      },
      {
        name: "pastInjuries",
        label: "What running-related injuries have you had in the past two years, and how were they treated?",
        type: "textarea",
      },
      {
        name: "surgeriesFractures",
        label: "Have you had any surgeries, fractures, or stress fractures?",
        type: "yesno",
        required: true,
        detail: "Details",
      },
      {
        name: "pregnancy",
        label: "Are you pregnant or have you given birth in the last 12 months?",
        type: "select",
        required: true,
        options: ["Yes", "No", "Not applicable"],
      },
      {
        name: "otherHealth",
        label: "Is there anything else about your health a coach should know?",
        type: "textarea",
      },
    ],
  },
  {
    id: "body",
    title: "Body measurements",
    fields: [
      {
        name: "sex",
        label: "Sex",
        type: "select",
        required: true,
        options: ["Male", "Female", "Other / prefer not to say"],
      },
      { name: "heightCm", label: "Height (cm)", type: "number", required: true },
      { name: "weightKg", label: "Weight (kg)", type: "number", required: true },
      {
        name: "restingHr",
        label: "Resting heart rate (bpm)",
        type: "number",
        hint: "Taken first thing in the morning, before getting up.",
      },
      { name: "maxHr", label: "Maximum heart rate (bpm), if known", type: "number" },
      {
        name: "maxHrMethod",
        label: "How was your maximum heart rate measured?",
        type: "select",
        options: ["Lab test", "Field test", "Estimate", "I don't know"],
      },
    ],
  },
  {
    id: "running",
    title: "Running background",
    fields: [
      { name: "runningDuration", label: "How long have you been running?", type: "text", required: true },
      {
        name: "weeklyDistanceKm",
        label: "Average weekly distance over the last 4 to 8 weeks (km)",
        type: "number",
        required: true,
      },
      { name: "longestRunKm", label: "Longest run in the last month (km)", type: "number" },
      {
        name: "runDaysPerWeek",
        label: "How many days per week do you currently run?",
        type: "number",
        required: true,
      },
      {
        name: "crossTraining",
        label: "What other sports or cross-training do you do (strength, cycling, yoga, etc.)?",
        type: "textarea",
      },
      {
        name: "recentResults",
        label: "Recent race results",
        type: "textarea",
        hint: "Distance, time, and date for each.",
      },
      { name: "personalBests", label: "Personal bests at any distance", type: "textarea" },
      {
        name: "device",
        label: "Do you train with a GPS watch or heart rate monitor? Which device?",
        type: "text",
      },
      {
        name: "priorTraining",
        label: "Have you followed a structured training plan or worked with a coach before? What worked and what didn't?",
        type: "textarea",
      },
    ],
  },
  {
    id: "life",
    title: "Life and goals",
    fields: [
      {
        name: "mainGoal",
        label: "What is your main goal?",
        type: "textarea",
        required: true,
        hint: "A target race, a finishing time, general fitness, weight loss, etc.",
      },
      { name: "raceName", label: "Target race name", type: "text" },
      { name: "raceDate", label: "Target race date", type: "date" },
      { name: "raceDistance", label: "Target race distance", type: "text" },
      {
        name: "availability",
        label: "Which days and how much time can you train each week?",
        type: "textarea",
      },
      {
        name: "workSchedule",
        label: "What is your work schedule like, including shifts, travel, and family commitments?",
        type: "textarea",
      },
      { name: "sleepHours", label: "How many hours do you usually sleep?", type: "number" },
      {
        name: "sleepQuality",
        label: "How would you rate your sleep quality?",
        type: "select",
        options: ["Poor", "Fair", "Good", "Excellent"],
      },
      {
        name: "stressLevel",
        label: "How would you rate your current stress level? (1 = low, 10 = high)",
        type: "select",
        options: SCALE,
      },
      { name: "diet", label: "Any dietary preferences or restrictions?", type: "text" },
      {
        name: "terrain",
        label: "Where do you usually run?",
        type: "select",
        options: ["Road", "Track", "Trail", "Treadmill", "A mix"],
      },
      {
        name: "trainingMode",
        label: "Do you prefer training by pace, heart rate, or effort (RPE)?",
        type: "select",
        options: ["Pace", "Heart rate", "Effort (RPE)", "Not sure"],
      },
      {
        name: "communication",
        label: "How do you want to communicate with your coach, and how often?",
        type: "textarea",
      },
    ],
  },
];

/** The waiver is its own final step; it isn't part of ONBOARDING_SECTIONS. */
export const ONBOARDING_STEP_TITLES = [...ONBOARDING_SECTIONS.map((s) => s.title), "Waiver"];

export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}
