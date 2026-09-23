import React from "react";
import { DrowsinessDetector } from "../components/drowsiness/DrowsinessDetector";

export function DrowsinessPage({ onDrowsinessAlert }) {
    return <DrowsinessDetector onDrowsinessAlert={onDrowsinessAlert} />;
}
