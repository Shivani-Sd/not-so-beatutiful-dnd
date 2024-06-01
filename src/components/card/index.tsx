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
  cards: CardInterface[];
  orderedCards: React.MutableRefObject<CardInterface[][]>;
  containerIndex: number;
  draggedCard: DraggedCardInterface | null;
  setCards: React.Dispatch<React.SetStateAction<CardInterface[]>>;
}

const Card: React.FC<CardProps> = ({
  card,
  cards,
  orderedCards,
  containerIndex,
  draggedCard,
  setCards,
}) => {
  const { id, name } = card;

  const dispatch = useDispatch();

  const cardRef = useRef<HTMLDivElement>(null);

  const [dragging, setDragging] = useState<boolean>(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setTimeout(() => {
      setDragging(true);
    }, 10);

    dispatch(setDraggedCard({ ...card, containerIndex: containerIndex }));
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();

    if (draggedCard && id !== draggedCard.id) {
      // Check whether card is dragged within the container
      if (containerIndex === draggedCard.containerIndex) {
        // Reorder cards
        const reorderedCards = _.cloneDeep(orderedCards.current);

        const indexToRemove = reorderedCards[containerIndex].findIndex(
          (card) => card.id === draggedCard.id
        );

        if (indexToRemove !== -1) {
          const elementToRemove = reorderedCards[containerIndex][indexToRemove];

          const indexToAdd = reorderedCards[containerIndex].findIndex(
            (card) => card.id === id
          );

          reorderedCards[containerIndex].splice(indexToRemove, 1);

          reorderedCards[containerIndex].splice(indexToAdd, 0, elementToRemove);

          // Assign new top values to reordered cards
          const cardsCopy = _.cloneDeep(cards);

          reorderedCards[containerIndex].forEach((card, index) => {
            const cardIndex = cards.findIndex(
              (cardCopy) => cardCopy.id === card.id
            );

            if (cardIndex !== -1) {
              const newTop = index * TOP_PAYLOAD;

              cardsCopy[cardIndex].top = newTop;
              card.top = newTop;
            }
          });

          orderedCards.current = reorderedCards;
          setCards(cardsCopy);
        }
      } else {
        // Reorder cards
        const reorderedCards = _.cloneDeep(
          orderedCards.current[containerIndex]
        );

        const startIndexRef = reorderedCards.findIndex(
          (card) => card.id === id
        );
        const startIndexCard = cards.findIndex((card) => card.id === id);

        if (reorderedCards[startIndexRef].top !== null) {
          if (
            cards[startIndexCard].top! ===
            orderedCards.current[containerIndex][startIndexRef].top!
          )
            for (let i = startIndexRef; i < reorderedCards.length; i++) {
              reorderedCards[i].top = TOP_PAYLOAD * (i + 1);
            }
          else
            for (let i = startIndexRef + 1; i < reorderedCards.length; i++) {
              reorderedCards[i].top! += TOP_PAYLOAD;
            }
        }

        // Assign new top values to reordered cards
        const cardsToRenderCopy = _.cloneDeep(cards);

        cardsToRenderCopy.forEach((card) => {
          const top = reorderedCards?.find(
            (reorderedCard) => reorderedCard.id === card.id
          )?.top;

          if (typeof top !== "undefined") card.top = top;
        });

        setCards(cardsToRenderCopy);
      }
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    e.stopPropagation();
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();

    setTimeout(() => {
      setDragging(false);
      dispatch(setDraggedCard(null));
    }, 50);
  };

  const clearEvents = () => {
    const card = cardRef.current;

    if (card) {
      card.removeEventListener("dragenter", handleDragEnter);
      card.removeEventListener("dragleave", handleDragEnter);
    }
  };

  useEffect(() => {
    const card = cardRef.current;

    if (card) {
      clearEvents();
      card.addEventListener("dragenter", handleDragEnter);
      card.addEventListener("dragleave", handleDragLeave);
    }

    return () => {
      clearEvents();
    };
  }, [draggedCard, cards]);

  return (
    <div
      draggable
      ref={cardRef}
      className={`card${dragging ? " dragging" : ""}`}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        position: card.top !== null ? "absolute" : "static",
        top: `${card.top}px`,
      }}
    >
      {name}
    </div>
  );
};

export default Card;
