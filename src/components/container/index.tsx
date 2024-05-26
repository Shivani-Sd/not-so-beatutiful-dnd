/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import _ from "lodash";

import { CardInterface } from "../../types";
import { TOP_PAYLOAD } from "../../constants";
import { RootState } from "../../store/store";
import Card from "../card";
import "./styles.css";

interface ContainerProps {
  index: number;
  cards: React.MutableRefObject<CardInterface[][]>;
  topPositions: React.MutableRefObject<number[]>;
}

const Container: React.FC<ContainerProps> = ({
  index,
  cards,
  topPositions,
}) => {
  const draggedCard = useSelector(
    (root: RootState) => root.appSlice.draggedCard
  );

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [cardsToRender, setCardsToRender] = useState<CardInterface[]>(
    cards.current[index]
  );

  const handleDrop = () => {
    if (draggedCard && index !== draggedCard.containerIndex) {
      const rearrangedCards = _.cloneDeep(cards.current);

      // Remove dragged card from source container
      const sourceContainer = rearrangedCards[draggedCard.containerIndex];

      const indexToRemove = sourceContainer.findIndex(
        (card) => card.id === draggedCard.id
      );

      sourceContainer.splice(indexToRemove, 1);
      
      sourceContainer.forEach(
        (card, index) => (card.top = topPositions.current[index])
      );

      cards.current[draggedCard.containerIndex] = sourceContainer;

      // Add dragged card to new container
      const cardsToRenderCopy = _.cloneDeep(cardsToRender);

      let top = topPositions.current[0];

      const indexToAdd = cardsToRenderCopy.findIndex((card) => {
        const result = top !== card.top;
        top += TOP_PAYLOAD;

        return result;
      });

      cardsToRenderCopy.splice(
        indexToAdd === -1 ? cardsToRenderCopy.length : indexToAdd,
        0,
        {
          id: draggedCard.id,
          name: draggedCard.name,
          top: indexToAdd === -1 ? top : top - TOP_PAYLOAD,
        }
      );

      cards.current[index] = cardsToRenderCopy;

      setCardsToRender(cardsToRenderCopy);
    }
  };

  const handleDropCancel = () => {
    const cardsToRenderCopy = _.cloneDeep(cardsToRender);

    let indexToAdd = -1;

    let top = topPositions.current[0];

    const tops = cardsToRenderCopy
      .map((card) => card.top)
      .sort((a, b) => a! - b!);

    for (let i = 0; i < tops.length; i++) {
      if (tops[i] !== top) {
        indexToAdd = i;
        break;
      }
      top += TOP_PAYLOAD;
    }

    if (indexToAdd !== -1) {
      cardsToRenderCopy.forEach((cardToRender) => {
        const indexToReplace = cards.current[index].findIndex(
          (card) => card.id === cardToRender.id
        );

        if (indexToReplace !== -1) {
          cardToRender.top = cards.current[index][indexToReplace].top;
        }
      });

      setCardsToRender(cardsToRenderCopy);
    }
  };

  const removeCardFromSourceContainer = () => {
    const cardsToRenderCopy = _.cloneDeep(cardsToRender);

    const newIds = new Set(cards.current[index].map((item) => item.id));

    const missingCard = cardsToRender.find((item) => !newIds.has(item.id));

    cardsToRenderCopy.splice(
      cardsToRenderCopy.findIndex((card) => card.id === missingCard?.id),
      1
    );

    cardsToRenderCopy.forEach((cardToRender) => {
      const indexToReplace = cards.current[index].findIndex(
        (card) => card.id === cardToRender.id
      );

      if (indexToReplace !== -1) {
        cardToRender.top = cards.current[index][indexToReplace].top;
      }
    });

    setCardsToRender(cardsToRenderCopy);
  };

  useEffect(() => {
    const container = containerRef.current;

    if (container) {
      const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
      };

      container.addEventListener("dragover", handleDragOver);
      container.addEventListener("drop", handleDrop);

      return () => {
        container.removeEventListener("dragover", handleDragOver);
        container.removeEventListener("drop", handleDrop);
      };
    }
  }, [draggedCard, cardsToRender]);

  useEffect(() => {
    // Remove dragged card from source container
    if (!draggedCard) {
      if (cardsToRender.length > cards.current[index].length)
        removeCardFromSourceContainer();

      handleDropCancel();
    }
  }, [draggedCard]);

  return (
    <div className="container" ref={containerRef}>
      {cardsToRender.map((card) => (
        <Card
          key={card.id}
          card={card}
          cards={cards}
          containerIndex={index}
          cardsToRender={cardsToRender}
          containerRef={containerRef}
          draggedCard={draggedCard}
          topPositions={topPositions}
          setCardsToRender={setCardsToRender}
        />
      ))}
    </div>
  );
};

export default Container;
