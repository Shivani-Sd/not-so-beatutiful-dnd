import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";

import { CardInterface, ContainerInterface } from "./types";
import { INITIAL_CARDS, TOP_PAYLOAD, TOP_PAYLOAD_START } from "./constants";
import Container from "./components/container";
import "./App.css";

function App() {
  const containers = useSelector((root: RootState) => root.appSlice.containers);

  const orderedContainers = useRef<ContainerInterface[]>(containers);

  const orderedCards = useRef<CardInterface[][]>(INITIAL_CARDS);

  const cardTopPositions = useRef<number[]>([]);

  const calculateTopPositions = () => {
    const maxNumberOfCards = orderedCards.current.reduce(
      (acc, container) => Math.max(acc, container.length),
      0
    );

    Array(maxNumberOfCards + 1)
      .fill(0)
      .forEach((_, index) => {
        if (index !== 0)
          cardTopPositions.current.push(
            TOP_PAYLOAD_START + TOP_PAYLOAD * index
          );
        else cardTopPositions.current.push(58);
      });

    orderedCards.current.forEach((container) => {
      container.forEach(
        (card, index) => (card.top = cardTopPositions.current[index])
      );
    });
  };

  useEffect(() => {
    calculateTopPositions();
  }, []);

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
