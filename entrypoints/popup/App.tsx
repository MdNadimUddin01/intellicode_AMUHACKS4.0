import { useState } from "react";
import reactLogo from "@/assets/react.svg";
import wxtLogo from "/wxt.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="bg-black">
      <h1 className="text-xl">WXT + React</h1>
    </div>
  );
}

export default App;
