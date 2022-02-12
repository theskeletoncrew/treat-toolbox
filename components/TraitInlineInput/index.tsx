import React from "react";
import { useState } from "react";

interface Props {
  type: string,
  value: string,
}

export const TraitInlineInput: React.FC<Props> = ({
    type,
    value,
}) => {
  const [newValue, setNewValue] = useState(value);

  const editTraitInline = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewValue(e.target.value);
    console.log(newValue);

    // If string is empty, reassign to original value
    if (newValue === "") {
      setNewValue(value);
      alert("Value cannot be blank.");
    }

    // If rarity not between 0 and 1, reassign to original value
    if (type === "rarity") {
      const rarity = parseFloat(e.target.value);
      if (0 > rarity || rarity > 1) {
        setNewValue(value);
        alert("Rarity must be between 0 and 1.");
      }
    }
  }

  return (
    <input
      className="z-10 max-w-sm input-value"
      value={newValue}
      onChange={(e => editTraitInline(e))}
    >
    </input>
  );
}
