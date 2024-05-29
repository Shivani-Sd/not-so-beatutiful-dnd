import { useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";

import { CardInterface, ContainerInterface } from "./types";
import { INITIAL_CARDS } from "./constants";
import Container from "./components/container";
import "./App.css";

function App() {
  const containers = useSelector((root: RootState) => root.appSlice.containers);

  const orderedContainers = useRef<ContainerInterface[]>(containers);

  const orderedCards = useRef<CardInterface[][]>(INITIAL_CARDS);

  const cardTopPositions = useRef<number[]>([]);

  return (
    <div id="App">
      <div id="containers">
        {containers.map((container, index) => (
          <Container
            key={container.id}
            index={index}
            orderedCards={orderedCards}
            container={container}
            cardTopPositions={cardTopPositions}
            orderedContainers={orderedContainers}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
