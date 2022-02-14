import React from "react";
import { useState } from "react";
import TraitValue, { TraitValues } from "../../models/traitValue";
import Trait from "../../models/trait";

interface Props {
  traitValue: TraitValue,
  projectId: string,
  collectionId: string,
  trait: Trait
}

export const TraitValuesRow: React.FC<Props> = ({
    traitValue,
    projectId,
    collectionId,
    trait,
}) => {
  const [newValue, setNewValue] = useState(traitValue);
  const [setLastValidValue, setPrevTraitValue] = useState(traitValue);

  const isNumber = (input: string) => {
    if (typeof(input) !== "string") {
      return false;
    }
    return !isNaN(Number(input)) && !isNaN(parseFloat(input));
  }

  const editTraitInline = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (type == "name" && e.target.value === "") {
      setNewValue({
        id: traitValue.id,
        name: setLastValidValue.name,
        rarity: newValue.rarity
      });
      alert("Name cannot be blank.");
      return;
    }

    if (type === "rarity") {
      if (e.target.value === "") {
        setNewValue({
          id: traitValue.id,
          name: newValue.name,
          rarity: setLastValidValue.rarity
        });
        alert("Rarity cannot be blank.");
        return;
      }
      if (!isNumber(e.target.value)) {
        setNewValue({
          id: traitValue.id,
          name: newValue.name,
          rarity: setLastValidValue.rarity
        });
        alert("Rarity must be a number between 0 and 1.");
        return;
      }

      const rarity = parseFloat(e.target.value);
      if (0 > rarity || rarity > 1) {
        setNewValue({
          id: traitValue.id,
          name: newValue.name,
          rarity: setLastValidValue.rarity
        });
        alert("Rarity must be a number between 0 and 1.");
        return;
      }

      // Input is valid rarity
      setNewValue({
        id: traitValue.id,
        name: newValue.name,
        rarity: (e.target.value)
      });
      return;
    }

      // Input is valid name
      setNewValue({
        id: traitValue.id,
        name: e.target.value,
        rarity: newValue.rarity
      });
      return;
  }

  const updateValues = async (data: TraitValue) => {
    data.rarity = Number(data.rarity);
    setPrevTraitValue(data);

    await TraitValues.update(
      data,
      traitValue.id,
      projectId,
      collectionId,
      trait.id
    );
  }

  return (
    <>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          <input
            className="input-value"
            value={newValue.name}
            onChange={e => editTraitInline(e, "name")}
            onBlur={() => updateValues(newValue)}
          >
          </input>
        </div>
      </td>

      {trait.isAlwaysUnique ? (
        ""
      ) : (
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            <input
              className="input-value"
              value={newValue.rarity}
              onChange={e => editTraitInline(e, "rarity")}
              onBlur={() => updateValues(newValue)}
            >
            </input>
          </div>
        </td>
      )}
    </>
  );
}
