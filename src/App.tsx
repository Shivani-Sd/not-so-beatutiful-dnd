import { useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";

import { CardInterface } from "./types";
import { INITIAL_CARDS } from "./constants";
import Container from "./components/container";
import "./App.css";

function App() {
  const containers = useSelector((root: RootState) => root.appSlice.containers);

  const cards = useRef<CardInterface[][]>(INITIAL_CARDS);

  const topPositions = useRef<number[]>([]);

  return (
    <div id="App">
      <div id="containers">
        {containers.map((container, index) => (
          <Container
            key={container.id}
            index={index}
            cards={cards}
            topPositions={topPositions}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
