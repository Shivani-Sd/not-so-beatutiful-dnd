/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import _ from "lodash";

import { CardInterface, DraggedCardInterface } from "../../types";
import { TOP_PAYLOAD } from "../../constants";
import { setDraggedCard } from "../../store/slices/appSlice";
import "./styles.css";

interface CardProps {
  card: CardInterface;
  cards: React.MutableRefObject<CardInterface[][]>;
  cardsToRender: CardInterface[];
  containerIndex: number;
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
  draggedCard: DraggedCardInterface | null;
  topPositions: React.MutableRefObject<number[]>;
  setCardsToRender: React.Dispatch<React.SetStateAction<CardInterface[]>>;
}

const Card: React.FC<CardProps> = ({
  card,
  cards,
  cardsToRender,
  containerIndex,
  containerRef,
  draggedCard,
  topPositions,
  setCardsToRender,
}) => {
  const { id, name } = card;

  const dispatch = useDispatch();

  const cardRef = useRef<HTMLDivElement>(null);

  const [dragging, setDragging] = useState<boolean>(false);

  const initializeTopPositions = () => {
    const positions = [...topPositions.current];

    const indexToAdd = cardsToRender.findIndex((card) => card.id === id);

    if (cardRef.current && containerRef.current) {
      const index = cardsToRender.findIndex((card) => card.id === id);

      const top =
        cardRef.current?.getBoundingClientRect().top -
        containerRef.current?.getBoundingClientRect().top;

      positions.splice(
        indexToAdd,
        0,
        cardRef.current?.getBoundingClientRect().top -
          containerRef.current?.getBoundingClientRect().top
      );

      topPositions.current = Array.from(new Set(positions));      
      cards.current[containerIndex][index].top = top;
      setCardsToRender(cards.current[containerIndex]);
    }
  };

  const handleDragStart = () => {
    setTimeout(() => {
      setDragging(true);
    }, 10);
    
    dispatch(setDraggedCard({ ...card, containerIndex: containerIndex }));
  };

  const handleDragOver = () => {
    if (draggedCard) {
      if (containerIndex === draggedCard.containerIndex) {
        // Change top positions of cards when moving within the same container (without rearrangement)
        const rearrangedCards = _.cloneDeep(cards.current);

        const indexToRemove = rearrangedCards[containerIndex].findIndex(
          (card) => card.id === draggedCard.id
        );

        if (indexToRemove !== -1) {
          // Rearrange cards
          const elementToRemove =
            rearrangedCards[containerIndex][indexToRemove];

          const indexToAdd = rearrangedCards[containerIndex].findIndex(
            (card) => card.id === id
          );

          rearrangedCards[containerIndex].splice(indexToRemove, 1);

          rearrangedCards[containerIndex].splice(
            indexToAdd,
            0,
            elementToRemove
          );

          const cardsToRenderCopy = _.cloneDeep(cardsToRender);

          rearrangedCards[containerIndex].forEach((card, index) => {
            const cardToRenderIndex = cardsToRender.findIndex(
              (cardToRender) => cardToRender.id === card.id
            );

            if (cardToRenderIndex !== -1) {
              cardsToRenderCopy[cardToRenderIndex].top =
                topPositions.current[index];
            }
          });

          cards.current = rearrangedCards;
          setCardsToRender(cardsToRenderCopy);
        }
      } else {
        // Change top positions of cards when moving to another container (without rearrangement)
        const rearrangedCards = _.cloneDeep(cards.current[containerIndex]);

        if (rearrangedCards.length === topPositions.current.length) {
          topPositions.current.push(
            topPositions.current[topPositions.current.length - 1] + TOP_PAYLOAD
          );
        }

        const startIndex = rearrangedCards.findIndex((card) => card.id === id);

        for (let i = startIndex; i < rearrangedCards.length; i++) {
          rearrangedCards[i].top = topPositions.current[i + 1];
        }

        const cardsToRenderCopy = _.cloneDeep(cardsToRender);

        cardsToRenderCopy.forEach((card) => {
          const top = rearrangedCards?.find(
            (rearrangedCard) => rearrangedCard.id === card.id
          )?.top;

          if (top) card.top = top;
        });

        setCardsToRender(cardsToRenderCopy);
      }
    }
  };

  const handleDragEnd = () => {
    setDragging(false);

    setTimeout(() => {
      dispatch(setDraggedCard(null));
    }, 50);
  };

  useEffect(() => {
    initializeTopPositions();
  }, []);

  useEffect(() => {
    cardRef.current?.addEventListener("dragover", handleDragOver);

    return () => {
      cardRef.current?.removeEventListener("dragover", handleDragOver);
    };
  }, [draggedCard]);

  return (
    <div
      draggable
      ref={cardRef}
      className={`card${dragging ? " dragging" : ""}`}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        position: card.top ? "absolute" : "static",
        top: `${card.top}px`,
        transition: "top ease 0.5s",
      }}
    >
      {name}
    </div>
  );
};

export default Card;
