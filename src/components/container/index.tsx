/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";

import { RootState } from "../../store/store";
import {
  setContainers,
  setDraggedContainer,
} from "../../store/slices/appSlice";
import { CardInterface, ContainerInterface } from "../../types";
import { LEFT_PAYLOAD, TOP_PAYLOAD } from "../../constants";
import Card from "../card";
import "./styles.css";

interface ContainerProps {
  index: number;
  container: ContainerInterface;
  cardTopPositions: React.MutableRefObject<number[]>;
  orderedCards: React.MutableRefObject<CardInterface[][]>;
  orderedContainers: React.MutableRefObject<ContainerInterface[]>;
}

const Container: React.FC<ContainerProps> = ({
  index,
  container,
  cardTopPositions,
  orderedCards,
  orderedContainers,
}) => {
  const { id } = container;

  const dispatch = useDispatch();

  const containers = useSelector((root: RootState) => root.appSlice.containers);
  const draggedCard = useSelector(
    (root: RootState) => root.appSlice.draggedCard
  );
  const draggedContainer = useSelector(
    (root: RootState) => root.appSlice.draggedContainer
  );

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [cards, setCards] = useState<CardInterface[]>(
    orderedCards.current[index] ?? []
  );
  const [dragging, setDragging] = useState<boolean>(false);

  const initializeTopPositions = () => {
    setCards(orderedCards.current[index]);
  };

  const removeCardFromSourceContainer = () => {
    const cardsCopy = _.cloneDeep(cards);

    const newIds = new Set(orderedCards.current[index].map((item) => item.id));

    const missingCard = cards.find((item) => !newIds.has(item.id));

    cardsCopy.splice(
      cardsCopy.findIndex((card) => card.id === missingCard?.id),
      1
    );

    cardsCopy.forEach((cardToRender) => {
      const indexToReplace = orderedCards.current[index].findIndex(
        (card) => card.id === cardToRender.id
      );

      if (indexToReplace !== -1) {
        cardToRender.top = orderedCards.current[index][indexToReplace].top;
      }
    });

    setCards(cardsCopy);
  };

  const handleDrop = (e: DragEvent) => {
    e.stopPropagation();

    if (draggedCard && index !== draggedCard.containerIndex) {
      const reorderedCards = _.cloneDeep(orderedCards.current);

      // Remove dragged card from source container
      const sourceContainer = reorderedCards[draggedCard.containerIndex];

      const indexToRemove = sourceContainer.findIndex(
        (card) => card.id === draggedCard.id
      );

      sourceContainer.splice(indexToRemove, 1);

      sourceContainer.forEach(
        (card, index) => (card.top = cardTopPositions.current[index])
      );

      orderedCards.current[draggedCard.containerIndex] = sourceContainer;

      // Add dragged card to new container
      const cardsCopy = _.cloneDeep(cards);

      let top = cardTopPositions.current[0];

      const indexToAdd = cardsCopy.findIndex((card) => {
        const result = top !== card.top;
        top += TOP_PAYLOAD;

        return result;
      });

      cardsCopy.splice(indexToAdd === -1 ? cardsCopy.length : indexToAdd, 0, {
        id: draggedCard.id,
        name: draggedCard.name,
        top: indexToAdd === -1 ? top : top - TOP_PAYLOAD,
      });

      orderedCards.current[index] = cardsCopy;
      setCards(cardsCopy);
    }
  };

  const handleDropCancel = () => {
    const cardsCopy = _.cloneDeep(cards);

    let indexToAdd = -1;

    let top = cardTopPositions.current[0];

    const tops = cardsCopy.map((card) => card.top).sort((a, b) => a! - b!);

    for (let i = 0; i < tops.length; i++) {
      if (tops[i] !== top) {
        indexToAdd = i;
        break;
      }
      top += TOP_PAYLOAD;
    }

    if (indexToAdd !== -1) {
      cardsCopy.forEach((cardToRender) => {
        const indexToReplace = orderedCards.current[index].findIndex(
          (card) => card.id === cardToRender.id
        );

        if (indexToReplace !== -1) {
          cardToRender.top = orderedCards.current[index][indexToReplace].top;
        }
      });

      setCards(cardsCopy);
    }
  };

  const handleDragStart = () => {
    setTimeout(() => {
      setDragging(true);
    }, 10);

    dispatch(setDraggedContainer({ ...container, containerIndex: index }));
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();

    // Check if the target container is not the same as the source
    if (draggedContainer && id !== draggedContainer.id) {
      // Reorder containers
      const orderedContainersCopy = _.cloneDeep(orderedContainers.current);

      const indexToRemove = orderedContainersCopy.findIndex(
        (container) => container.id === draggedContainer.id
      );

      const indexToAdd = orderedContainersCopy.findIndex(
        (container) => container.id === id
      );

      orderedContainersCopy.splice(indexToRemove, 1);

      const { containerIndex, ...rest } = draggedContainer;

      orderedContainersCopy.splice(indexToAdd, 0, { ...rest });

      // Assign new left values to reordered containers
      orderedContainersCopy.forEach((container, index) => {
        container.left =
          (index -
            containers.findIndex((element) => element.id === container.id)) *
          LEFT_PAYLOAD;
      });

      // Copy new left values to state
      const containersCopy = _.cloneDeep(containers);

      containersCopy.forEach((container) => {
        container.left =
          orderedContainersCopy.find(
            (containerRef) => containerRef.id === container.id
          )?.left ?? 0;
      });

      orderedContainers.current = orderedContainersCopy;
      dispatch(setContainers(containersCopy));
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    setDragging(false);

    dispatch(setDraggedContainer(null));
  };

  const clearEvents = () => {
    const container = containerRef.current;

    if (container) {
      container.removeEventListener("dragover", handleDragOver);
      container.removeEventListener("drop", handleDrop);
    }
  };

  useEffect(() => {
    const container = containerRef.current;

    if (container) {
      clearEvents();

      container.addEventListener("dragover", handleDragOver);
      container.addEventListener("drop", handleDrop);

      return () => {
        clearEvents();
      };
    }
  }, [draggedCard, cards]);

  useEffect(() => {
    const container = containerRef.current;

    if (container) {
      container.removeEventListener("dragenter", handleDragEnter);

      container.addEventListener("dragenter", handleDragEnter);

      return () => {
        container.removeEventListener("dragenter", handleDragEnter);
      };
    }
  }, [draggedContainer, containers]);

  useEffect(() => {
    // Remove dragged card from source container
    if (!draggedCard) {
      if (cards.length > orderedCards.current[index].length)
        removeCardFromSourceContainer();

      handleDropCancel();
    }
  }, [draggedCard]);

  useEffect(() => {
    initializeTopPositions();
  }, []);

  return (
    <div
      className={`container${dragging ? " dragging" : ""}`}
      ref={containerRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        left: `${container.left}px`,
      }}
    >
      <div className="container-title">{container.name}</div>
      {cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          orderedCards={orderedCards}
          containerIndex={index}
          cards={cards}
          draggedCard={draggedCard}
          topPositions={cardTopPositions}
          setCards={setCards}
        />
      ))}
    </div>
  );
};

export default Container;
