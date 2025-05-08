import React, {useState, useEffect} from 'react';
import {DragDropContext, Draggable, Droppable} from '@hello-pangea/dnd';
import styles from './LineupManager.module.css';

const LineupDraggableList = ({batters, setBatters, title}) => {
    const startingCount = 9;
    const [players, setPlayers] = useState({
        starting: batters.slice(0, startingCount),
        substitutes: batters.slice(startingCount)
    });

    useEffect(() => {
        setBatters([...players.starting, ...players.substitutes]);
    }, [players, setBatters]);

    const swap = (listA, indexA, listB, indexB) => {
        const newListA = [...listA];
        const newListB = [...listB];
        const temp = newListA[indexA];
        newListA[indexA] = newListB[indexB];
        newListB[indexB] = temp;
        return [newListA, newListB];
    };

    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };

    const handleDragEnd = (result) => {
        const {source, destination} = result;
        if (!destination) return;

        const sourceId = source.droppableId;
        const destId = destination.droppableId;

        if (sourceId === destId) {
            const updated = reorder(players[sourceId], source.index, destination.index);
            setPlayers(prev => ({...prev, [sourceId]: updated}));
        } else {
            const [newSource, newDest] = swap(
                players[sourceId], source.index,
                players[destId], destination.index
            );
            setPlayers(prev => ({
                ...prev,
                [sourceId]: newSource,
                [destId]: newDest
            }));
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{title}</h2>
            <DragDropContext onDragEnd={handleDragEnd}>
                {['starting', 'substitutes'].map((key) => (
                    <Droppable droppableId={key} key={key}>
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={styles.listBox}
                            >
                                <h3>{key === 'starting' ? '선발 타자' : '후보 선수'}</h3>
                                {players[key].map((player, index) => (
                                    <Draggable draggableId={player.id} index={index} key={player.id}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={styles.playerCard}
                                            >
                                                <strong>{index + 1}. {player.name}</strong>
                                                <div>{player.position} / {player.hand}</div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                ))}
            </DragDropContext>
        </div>
    );
};

export default LineupDraggableList;