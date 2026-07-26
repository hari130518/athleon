"use client";

import { updateAthleteProfileCoachFields } from "@/app/actions";
import DebouncedField from "@/components/DebouncedField";
import type { AthleteProfile } from "@/lib/types";

const COACH_FIELDS: { key: keyof AthleteProfile; label: string }[] = [
  { key: "i_intervals", label: "I - Intervals" },
  { key: "s_speed", label: "S - Speed (200m, 400m)" },
  { key: "t_tempo", label: "T - Tempo" },
  { key: "marathon_m", label: "Marathon M" },
  { key: "e_endurance", label: "E - Endurance" },
  { key: "vdot", label: "VDOT" },
  { key: "best_recent_timing", label: "Best Recent Timing" },
  { key: "pb_5km", label: "PB - 5km" },
  { key: "pb_10km", label: "PB - 10km" },
  { key: "pb_21km", label: "PB - 21km" },
  { key: "pb_42km", label: "PB - 42km" },
];

export default function CoachProfileFields({
  athleteId,
  profile,
}: {
  athleteId: string;
  profile: AthleteProfile;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {COACH_FIELDS.map(({ key, label }) => (
        <DebouncedField
          key={key}
          label={label}
          initialValue={profile[key] ?? ""}
          onSave={(value) => updateAthleteProfileCoachFields(athleteId, { [key]: value })}
        />
      ))}
    </div>
  );
}
