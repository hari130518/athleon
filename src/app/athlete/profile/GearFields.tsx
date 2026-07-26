"use client";

import { updateAthleteEquipment } from "@/app/actions";
import DebouncedField from "@/components/DebouncedField";

export default function GearFields({
  athleteId,
  watch,
  shoe,
}: {
  athleteId: string;
  watch: string;
  shoe: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <DebouncedField
        label="Watch"
        initialValue={watch}
        onSave={(value) => updateAthleteEquipment(athleteId, { watch: value })}
      />
      <DebouncedField
        label="Shoe"
        initialValue={shoe}
        onSave={(value) => updateAthleteEquipment(athleteId, { shoe: value })}
      />
    </div>
  );
}
