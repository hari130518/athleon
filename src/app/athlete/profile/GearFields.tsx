"use client";

import { updateAthleteEquipment } from "@/app/actions";
import DebouncedField from "@/components/DebouncedField";
import TagInput from "@/components/TagInput";

export default function GearFields({
  athleteId,
  watch,
  shoes,
}: {
  athleteId: string;
  watch: string;
  shoes: string[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <DebouncedField
        label="Watch"
        initialValue={watch}
        onSave={(value) => updateAthleteEquipment(athleteId, { watch: value })}
      />
      <TagInput
        label="Shoes"
        initialTags={shoes}
        onSave={(value) => updateAthleteEquipment(athleteId, { shoes: value })}
      />
    </div>
  );
}
