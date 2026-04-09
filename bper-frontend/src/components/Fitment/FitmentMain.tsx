import { useState } from "react";
import { FitmentForm } from "./FitmentForm";
import { FitmentRankings } from "./FitmentRankings";

export type ViewType = "scorer" | "rankings";

export function FitmentMain() {
  const [activeView, setActiveView] = useState<ViewType>("scorer");

  return (
    <div className="w-full flex-1 flex flex-col">
      {activeView === "scorer" ? (
        <FitmentForm onSwitchView={(view) => setActiveView(view)} activeView={activeView} />
      ) : (
        <FitmentRankings onSwitchView={(view) => setActiveView(view)} activeView={activeView} />
      )}
    </div>
  );
}
