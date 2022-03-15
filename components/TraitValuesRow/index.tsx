import React from "react";
import { useState, KeyboardEvent } from "react";
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
  const [prevValue, setPrevValue] = useState(traitValue);

  const isNumber = (input: string) => {
    if (typeof(input) !== "string") {
      return false;
    }
    return !isNaN(Number(input)) && !isNaN(parseFloat(input));
  }

  const editTraitInline = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (type === 'rarity') {
      setNewValue({
        id: traitValue.id,
        name: newValue.name,
        rarity: e.target.value
      });
      return;
    }

    setNewValue({
      id: traitValue.id,
      name: e.target.value,
      rarity: newValue.rarity
    });
    return;
  }

  const submitWithEnter = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      updateValues();
    }
  }

  const updateValues = async () => {
    let data = newValue;

    if (data.name === "") {
      setNewValue({
        id: traitValue.id,
        name: prevValue.name,
        rarity: newValue.rarity
      });
      alert("Name cannot be blank.");
      return;
    }

    if (String(data.rarity) === "") {
      setNewValue({
        id: traitValue.id,
        name: newValue.name,
        rarity: prevValue.rarity
      });
      alert("Rarity cannot be blank.");
      return;
    }

    data.rarity = Number(data.rarity);

    if (!isNumber(String(data.rarity))) {
      setNewValue({
        id: traitValue.id,
        name: newValue.name,
        rarity: prevValue.rarity
      });
      alert("Rarity must be a number between 0 and 1.");
      return;
    }

    if (prevValue.rarity == -1 && data.rarity == -1) {
      return;
    }

    if (0 > data.rarity || data.rarity > 1) {
      setNewValue({
        id: traitValue.id,
        name: newValue.name,
        rarity: prevValue.rarity
      });
      alert("Rarity must be a number between 0 and 1.");
      return;
    }

    setPrevValue(data);
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
            className="p-2 input-value"
            value={newValue.name}
            onChange={e => editTraitInline(e, "name")}
            onBlur={() => updateValues()}
            onKeyDown={(e) => submitWithEnter(e)}
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
              className="p-2 input-value"
              value={newValue.rarity}
              onChange={e => editTraitInline(e, "rarity")}
              onBlur={() => updateValues()}
              onKeyDown={(e) => submitWithEnter(e)}
            >
            </input>
          </div>
        </td>
      )}
    </>
  );
}
