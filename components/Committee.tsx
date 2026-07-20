"use client";

import { useEffect } from "react";
import { useIC } from "@/lib/store";
import Landing from "./screens/Landing";
import Brief from "./screens/Brief";
import Room from "./screens/Room";
import Report from "./screens/Report";

export default function Committee() {
  const screen = useIC((s) => s.screen);
  const init = useIC((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {screen === "landing" && <Landing />}
      {screen === "brief" && <Brief />}
      {screen === "room" && <Room />}
      {screen === "report" && <Report />}
    </div>
  );
}
