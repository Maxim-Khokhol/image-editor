import React, { useEffect, useRef, useState } from 'react';
import userModule from '../../user.js';
import "../App.css";
import { Subblock } from './Subblock';
import {useLocation, useNavigate, useParams} from "react-router-dom";
import axios from "axios";

export function ProjectPage({ onLogout }) {
    const [user, setUser] = useState(null);
    const [currentAction, setCurrentAction] = useState("cursor");
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [blocks, setBlocks] = useState([]);
    const workingField = useRef(null);
    const [currentBlock, setCurrentBlock] = useState(null);
    const cursorAction = useRef(null);
    const [selectedCells, setSelectedCells] = useState([]);
    const [isShiftPressed, setIsShiftPressed] = useState(false);
    const [isCtrlPressed, setIsCtrlPressed] = useState(false);
    const navigate = useNavigate();
    const [projectName, setProjectName] = useState('');
    const { projectId } = useParams();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        async function initialize() {
            if (!user) {
                const userData = await userModule.fetchUserInfo();
                setUser(userData);
            }

            if (projectId) {
                try {
                    console.log(`Fetching project with ID: ${projectId}`);
                    const response = await axios.get(`/api/projects/${projectId}`);
                    console.log("Project data loaded:", response.data);
                    setBlocks(response.data.blocks || []);
                    setProjectName(response.data.name || "");
                } catch (error) {
                    console.error("Error loading project:", error);
                }
            }
            setIsLoading(false);
        }

        initialize();
    }, [projectId, user]);



    const saveProjectData = async () => {
        const projectData = {
            name: projectName,
            blocks: blocks.map(block => ({
                id: block.id,
                top: block.top,
                left: block.left,
                width: block.width,
                height: block.height,
                gridX: block.gridX,
                gridY: block.gridY,
                gridGap: block.gridGap,
                padding: block.padding,
                backgroundColor: block.backgroundColor,
                images: block.images,
                mergedCells: block.mergedCells || [],
                hiddenCells: block.hiddenCells || [],
            }))
        };

        try {
            await axios.put(`/api/updateProject
            /${projectId}`, projectData);
            console.log("The project was saved successfully.");
        } catch (error) {
            console.error("Error saving project:", error);
        }
    };

    const handleSaveAndExit = async () => {
        await saveProjectData();
        navigate('/');
    };


    useEffect(() => {
        if (!isFirstLoad) {
            if (workingField.current) {
                if (currentAction === "block") {
                    workingField.current.style.cursor = "crosshair";
                } else if (currentAction) {
                    workingField.current.style.cursor = "auto";
                }
            }
        }
        setIsFirstLoad(false);
    }, [currentAction]);

    useEffect(() => {
        if (currentBlock) {
            const block = document.querySelector(`.collage-${currentBlock.id}`);
            if (block) {
                block.style.border = "2px solid dodgerblue";
            }

            function handleClickOutside(e) {
                if (!e.target.closest('.control-panel') &&
                    (e.clientX < block.getBoundingClientRect().x ||
                        e.clientX > block.getBoundingClientRect().x + block.getBoundingClientRect().width ||
                        e.clientY < block.getBoundingClientRect().y ||
                        e.clientY > block.getBoundingClientRect().y + block.getBoundingClientRect().height)) {
                    block.style.border = "none";
                    setCurrentBlock(null);
                    document.removeEventListener("mousedown", handleClickOutside);
                }
            }

            document.addEventListener("mousedown", handleClickOutside);

            return () => {
                if (block) {
                    block.style.border = "none";
                }
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    }, [currentBlock]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Shift") {
                setIsShiftPressed(true);
            }
            if (event.key === "Control") {
                setIsCtrlPressed(true);
            }
        };

        const handleKeyUp = (event) => {
            if (event.key === "Shift") {
                setIsShiftPressed(false);
            }
            if (event.key === "Control") {
                setIsCtrlPressed(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    const handleLogout = () => {
        userModule.logout(navigate);
        onLogout();
    };

    if (!user) {
        return <p>Loading...</p>;
    }

    function chooseNewActionBtnDesign(event) {
        const panelItems = document.querySelectorAll(".panel__item");
        panelItems.forEach(item => {
            item.style.backgroundColor = "white";
        });
        event.currentTarget.style.backgroundColor = "rgb(237, 240, 247)";
    }

    const addBlockCollage = (event) => {
        const startY = event.clientY;
        const startX = event.clientX;

        const newBlock = {
            id: blocks.length,
            top: startY,
            left: startX,
            width: 0,
            height: 0,
            backgroundColor: "white",
            gridX: 1,
            gridY: 1,
            gridGap: 5,
            padding: 5,
        };
        setBlocks((prevBlocks) => [...prevBlocks, newBlock]);
        setCurrentBlock(newBlock);

        const resizeBlock = (e) => {
            const xDirectionRightToLeft = e.clientX < startX;
            const yDirectionBottomToTop = e.clientY < startY;

            const updatedWidth = Math.abs(e.clientX - startX);
            const updatedHeight = Math.abs(e.clientY - startY);

            setBlocks((prevBlocks) =>
                prevBlocks.map((block) =>
                    block.id === newBlock.id
                        ? {
                            ...block,
                            top: yDirectionBottomToTop ? startY - updatedHeight : startY,
                            left: xDirectionRightToLeft ? startX - updatedWidth : startX,
                            width: updatedWidth,
                            height: updatedHeight
                        }
                        : block
                )
            );

            setCurrentBlock((prevCurrentBlock) => ({
                ...prevCurrentBlock,
                top: yDirectionBottomToTop ? startY - updatedHeight : startY,
                left: xDirectionRightToLeft ? startX - updatedWidth : startX,
                width: updatedWidth,
                height: updatedHeight
            }));
        };

        const finalizeBlock = () => {
            window.removeEventListener('mousemove', resizeBlock);
            window.removeEventListener('mouseup', finalizeBlock);
            setCurrentAction("cursor");
            cursorAction.current.click();
        };

        window.addEventListener('mousemove', resizeBlock);
        window.addEventListener('mouseup', finalizeBlock);
    };

    const updateBlockProperty = (property, value) => {
        setBlocks((prevBlocks) =>
            prevBlocks.map((block) =>
                block.id === currentBlock.id ? { ...block, [property]: value } : block
            )
        );
        setCurrentBlock((prevCurrentBlock) => ({
            ...prevCurrentBlock,
            [property]: value,
        }));
    };

    const deleteCurrentBlock = () => {
        if (window.confirm("Are you sure you want to delete this collage?")) {
            setBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== currentBlock.id));
            setCurrentBlock(null);
        }
    };

    const handleDragStart = (e, block) => {
        if (!isCtrlPressed) return;
        e.stopPropagation();
        setCurrentBlock(block);

        const offsetX = e.clientX - block.left;
        const offsetY = e.clientY - block.top;

        const handleDragMove = (e) => {
            setBlocks((prevBlocks) =>
                prevBlocks.map((b) =>
                    b.id === block.id
                        ? {
                            ...b,
                            left: e.clientX - offsetX,
                            top: e.clientY - offsetY,
                        }
                        : b
                )
            );
            setCurrentBlock((prevCurrentBlock) => ({
                ...prevCurrentBlock,
                left: e.clientX - offsetX,
                top: e.clientY - offsetY,
            }));
        };

        const handleDragEnd = () => {
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
        };

        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
    };


    const resizeElements = (block) => {
        if (currentBlock && block.id === currentBlock.id) {
            return (
                <>
                    <div
                        className="current-block__resize-el current-block__resize-el-top-left"
                        style={{ position: 'absolute', zIndex: 10, width: '10px', height: '10px', backgroundColor: 'blue' }}
                        onMouseDown={(e) => startResizing(e, 'top-left')}
                    ></div>
                    <div
                        className="current-block__resize-el current-block__resize-el-top-right"
                        style={{ position: 'absolute', zIndex: 10, width: '10px', height: '10px', backgroundColor: 'blue' }}
                        onMouseDown={(e) => startResizing(e, 'top-right')}
                    ></div>
                    <div
                        className="current-block__resize-el current-block__resize-el-bottom-left"
                        style={{ position: 'absolute', zIndex: 10, width: '10px', height: '10px', backgroundColor: 'blue' }}
                        onMouseDown={(e) => startResizing(e, 'bottom-left')}
                    ></div>
                    <div
                        className="current-block__resize-el current-block__resize-el-bottom-right"
                        style={{ position: 'absolute', zIndex: 10, width: '10px', height: '10px', backgroundColor: 'blue' }}
                        onMouseDown={(e) => startResizing(e, 'bottom-right')}
                    ></div>
                    <div className="current-block__size-block">
                        W: {currentBlock.width}px H: {currentBlock.height}px
                    </div>
                </>
            );
        }
    };


    const startResizing = (e, direction) => {
        e.stopPropagation();
        e.preventDefault();

        const startX = e.clientX;
        const startY = e.clientY;
        const initialWidth = currentBlock.width;
        const initialHeight = currentBlock.height;
        const initialTop = currentBlock.top;
        const initialLeft = currentBlock.left;

        const resize = (e) => {
            let newWidth = initialWidth;
            let newHeight = initialHeight;
            let newTop = initialTop;
            let newLeft = initialLeft;

            // Изменяем размеры в зависимости от угла
            if (direction.includes('right')) {
                newWidth = initialWidth + (e.clientX - startX);
            } else if (direction.includes('left')) {
                newWidth = initialWidth - (e.clientX - startX);
                newLeft = initialLeft + (e.clientX - startX);
            }

            if (direction.includes('bottom')) {
                newHeight = initialHeight + (e.clientY - startY);
            } else if (direction.includes('top')) {
                newHeight = initialHeight - (e.clientY - startY);
                newTop = initialTop + (e.clientY - startY);
            }

            setBlocks((prevBlocks) =>
                prevBlocks.map((block) =>
                    block.id === currentBlock.id
                        ? {
                            ...block,
                            width: newWidth > 0 ? newWidth : 0,
                            height: newHeight > 0 ? newHeight : 0,
                            top: newTop,
                            left: newLeft
                        }
                        : block
                )
            );

            setCurrentBlock((prevBlock) => ({
                ...prevBlock,
                width: newWidth > 0 ? newWidth : 0,
                height: newHeight > 0 ? newHeight : 0,
                top: newTop,
                left: newLeft
            }));
        };

        const stopResizing = () => {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResizing);
        };

        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResizing);
    };

    const handleCellClick = (index) => {
        if (isShiftPressed) {
            setSelectedCells((prevSelected) => {
                if (prevSelected.includes(index)) {
                    return prevSelected.filter((cellIndex) => cellIndex !== index);
                } else {
                    return [...prevSelected, index];
                }
            });
        }
    };






    const mergeSelectedCells = () => {
        if (selectedCells.length < 2) return;

        const sortedIndices = selectedCells.sort((a, b) => a - b);
        const minIndex = sortedIndices[0];
        const maxIndex = sortedIndices[sortedIndices.length - 1];

        const startRow = Math.floor(minIndex / currentBlock.gridX);
        const endRow = Math.floor(maxIndex / currentBlock.gridX);
        const startCol = minIndex % currentBlock.gridX;
        const endCol = maxIndex % currentBlock.gridX;

        const isRectangular = sortedIndices.every((index) => {
            const row = Math.floor(index / currentBlock.gridX);
            const col = index % currentBlock.gridX;
            return row >= startRow && row <= endRow && col >= startCol && col <= endCol;
        });

        if (!isRectangular) {
            alert("Only rectangular or square shapes can be combined.");
            return;
        }

        setBlocks((prevBlocks) =>
            prevBlocks.map((block) =>
                block.id === currentBlock.id
                    ? {
                        ...block,
                        mergedCells: [
                            ...(block.mergedCells || []),
                            { startRow, endRow, startCol, endCol },
                        ],
                    }
                    : block
            )
        );

        setSelectedCells([]);
    };

    const renderGridCells = (block) => {
        const cells = [];
        const { gridX, gridY, mergedCells = [], hiddenCells = [] } = block;

        for (let row = 0; row < gridY; row++) {
            for (let col = 0; col < gridX; col++) {
                const index = row * gridX + col;

                if (hiddenCells.includes(index)) {
                    cells.push(
                        <div
                            key={index}
                            style={{
                                width: '100%',
                                height: '100%',
                                visibility: 'hidden',
                                pointerEvents: 'none',
                            }}
                        />
                    );
                    continue;
                }

                const mergedCell = mergedCells.find(
                    (cell) =>
                        row >= cell.startRow &&
                        row <= cell.endRow &&
                        col >= cell.startCol &&
                        col <= cell.endCol
                );

                const handleDragImage = (e, index) => {
                    const img = e.target;
                    const startX = e.clientX;
                    const startY = e.clientY;

                    const initialLeft = parseFloat(img.style.left) || 0;
                    const initialTop = parseFloat(img.style.top) || 0;

                    const onMove = (moveEvent) => {
                        const deltaX = moveEvent.clientX - startX;
                        const deltaY = moveEvent.clientY - startY;

                        if (initialLeft + deltaX <= 0 && initialLeft + deltaX > -(img.getBoundingClientRect().width - img.parentNode.getBoundingClientRect().width)) {
                            img.style.left = `${initialLeft + deltaX}px`;
                        }
                        if (initialTop + deltaY <= 0 && initialTop + deltaY > -(img.getBoundingClientRect().height - img.parentNode.getBoundingClientRect().height)) {
                            img.style.top = `${initialTop + deltaY}px`;
                        }
                    };

                    const onStop = () => {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onStop);
                    };

                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onStop);
                };


                const renderImageStyle = () => {
                    if (!cellHasImage) {
                        return {
                            width: '20px',
                            height: 'auto',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            cursor: 'pointer',
                        };
                    }

                    const cellRef = document.querySelector(`.subblock-${index}`);
                    const containerWidth = cellRef?.getBoundingClientRect().width || 0;
                    const containerHeight = cellRef?.getBoundingClientRect().height || 0;

                    const imageWidth = block.images[index].width;
                    const imageHeight = block.images[index].height;

                    if (imageWidth <= imageHeight) {

                        if ((containerWidth / imageWidth) * imageHeight < containerHeight) {

                            return {
                                width: 'auto',
                                height: '100%',
                            };
                        }
                        return {
                            width: '100%',
                            height: 'auto',
                        };
                    } else {
                        if ((containerHeight / imageHeight) * imageWidth < containerWidth) {
                            return {
                                width: '100%',
                                height: 'auto',
                            };
                        }
                        return {
                            width: 'auto',
                            height: '100%',
                        };
                    }

                };

                const cellHasImage = block.images && block.images[index];

                if (mergedCell) {
                    if (row === mergedCell.startRow && col === mergedCell.startCol) {
                        cells.push(
                            <div
                                className={`subblock-${index} subblock${selectedCells.includes(index) ? "-hover" : ""}`}
                                key={index}
                                style={{
                                    gridRow: `span ${mergedCell.endRow - mergedCell.startRow + 1}`,
                                    gridColumn: `span ${mergedCell.endCol - mergedCell.startCol + 1}`,
                                    backgroundColor: "rgba(248, 245, 239)",
                                    position: 'relative',
                                    overflow: 'hidden',
                                    pointerEvents: cellHasImage ? 'none' : 'auto',
                                }}
                                onClick={() => !cellHasImage && handleCellClick(index)}
                            >

                                {cellHasImage &&
                                    <img
                                        src='../src/assets/close.svg'
                                        alt="Close"
                                        className="close-btn-img-collage"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeImage(index);
                                        }}
                                    />
                                }
                                <img
                                    className="download__svg"
                                    src={cellHasImage ? block.images[index]?.src : "../src/assets/download.svg"}
                                    alt="download svg"
                                    style={Object.assign(renderImageStyle(), {
                                        position: 'absolute',
                                        left: cellHasImage ? 0 : '50%',
                                        top: cellHasImage ? 0 : '50%',
                                        transform: cellHasImage ? 'none' : 'translate(-50%, -50%)',
                                        cursor: cellHasImage ? 'move' : 'pointer',
                                    })}
                                    onMouseDown={(e) => cellHasImage && handleDragImage(e, index)}
                                    onClick={(e) => {
                                        if (!cellHasImage) {
                                            e.stopPropagation();
                                            handleImageClick(index);
                                            console.log("Тип изображения:", e.target);
                                        }
                                    }}
                                />
                            </div>
                        );
                    }
                } else {
                    cells.push(
                        <div
                            className={`subblock${selectedCells.includes(index) ? "-hover" : ""}`}
                            key={index}
                            style={{

                                border: selectedCells.includes(index) ? '2px solid blue' : '1px dashed lightsteelblue',
                                backgroundColor: cellHasImage ? 'transparent' : "rgba(248, 245, 239)",
                                position: 'relative',
                                overflow: 'hidden',
                                pointerEvents: cellHasImage ? 'none' : 'auto',
                            }}
                            onClick={() => !cellHasImage && handleCellClick(index)}
                        >
                            {cellHasImage &&
                                <img
                                    src='../src/assets/close.svg'
                                    alt="Close"
                                    className="close-btn-img-collage"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage(index);
                                    }}
                                />
                            }
                            <img
                                className="download__svg"
                                src={cellHasImage ? block.images[index]?.src : "../src/assets/download.svg"}
                                alt="download svg"
                                style={Object.assign(renderImageStyle(), {
                                    position: 'absolute',
                                    left: cellHasImage ? 0 : '50%',
                                    top: cellHasImage ? 0 : '50%',
                                    transform: cellHasImage ? 'none' : 'translate(-50%, -50%)',
                                    cursor: cellHasImage ? 'move' : 'pointer',
                                })}
                                onMouseDown={(e) => cellHasImage && handleDragImage(e, index)}
                                onClick={(e) => {
                                    if (!cellHasImage) {
                                        e.stopPropagation();
                                        handleImageClick(index);
                                        console.log("Тип изображения:", typeof e.target);
                                    }
                                }}
                            />
                        </div>
                    );
                }
            }
        }
        return cells;
    };



    function handleImageClick(index){
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.src = event.target.result;

                    img.onload = () => {
                        const imageData = {
                            src: event.target.result,
                            width: img.width,
                            height: img.height,
                        };

                        setBlocks((prevBlocks) =>
                            prevBlocks.map((block) =>
                                block.id === currentBlock.id
                                    ? {
                                        ...block,
                                        images: {
                                            ...(block.images || {}),
                                            [index]: imageData,
                                        },
                                    }
                                    : block
                            )
                        );
                    };
                };
                reader.readAsDataURL(file);
            }
        };
        !isShiftPressed ? fileInput.click() : undefined;
    };



    const hideSelectedCells = () => {
        setBlocks((prevBlocks) =>
            prevBlocks.map((block) =>
                block.id === currentBlock.id
                    ? {
                        ...block,
                        hiddenCells: [
                            ...(block.hiddenCells || []),
                            ...selectedCells,
                        ],
                    }
                    : block
            )
        );
        setSelectedCells([]);
    };


    const showAllHiddenCells = () => {
        setBlocks((prevBlocks) =>
            prevBlocks.map((block) =>
                block.id === currentBlock.id
                    ? { ...block, hiddenCells: [] }
                    : block
            )
        );
    };

    const removeImage = (index) => {
        setBlocks((prevBlocks) =>
            prevBlocks.map((block) =>
                block.id === currentBlock.id
                    ? {
                        ...block,
                        images: {
                            ...(block.images || {}),
                            [index]: null,
                        },
                    }
                    : block
            )
        );
    };







    return (
        <div>
            <div className="container">
                <header className="header">
                    <h1>{projectName}</h1>
                    <button onClick={handleSaveAndExit}>Save and exit</button>
                    <button onClick={handleLogout} className="header__logout-btn">Logout</button>
                </header>

                <aside className="control-panel">
                    {currentBlock ? (
                        <div>
                            <p className="control-panel__name">Collage №{currentBlock.id + 1}</p>

                            <div className="control-panel__container">
                                <label className="control-panel__label">Width:</label>
                                <input
                                    type="number"
                                    className="control-panel__input"
                                    value={currentBlock.width}
                                    onChange={(e) => updateBlockProperty("width", Math.max(0, Number(e.target.value)))}
                                />
                            </div>

                            <div className="control-panel__container">
                                <label className="control-panel__label">Height:</label>
                                <input
                                    type="number"
                                    className="control-panel__input"
                                    value={currentBlock.height}
                                    onChange={(e) => updateBlockProperty("height", Math.max(0, Number(e.target.value)))}
                                />
                            </div>

                            <div className="control-panel__container">
                                <label className="control-panel__label">X (columns):</label>
                                <input
                                    type="number"
                                    className="control-panel__input"
                                    value={currentBlock.gridX}
                                    onChange={(e) => updateBlockProperty("gridX", Math.max(1, Number(e.target.value)))}
                                />
                            </div>

                            <div className="control-panel__container">
                                <label className="control-panel__label">Y (rows):</label>
                                <input
                                    type="number"
                                    className="control-panel__input"
                                    value={currentBlock.gridY}
                                    onChange={(e) => updateBlockProperty("gridY", Math.max(1, Number(e.target.value)))}
                                />
                            </div>

                            <div className="control-panel__container">
                                <label className="control-panel__label">Gap:</label>
                                <input
                                    type="number"
                                    className="control-panel__input"
                                    value={currentBlock.gridGap}
                                    onChange={(e) => updateBlockProperty("gridGap", Math.max(0, Number(e.target.value)))}
                                />
                            </div>

                            <div className="control-panel__container">
                                <label className="control-panel__label">Color:</label>
                                <input
                                    type="color"
                                    className="control-panel__input"
                                    value={currentBlock.backgroundColor}
                                    onChange={(e) => updateBlockProperty("backgroundColor", e.target.value)}
                                />
                            </div>

                            <div className="control-panel__container">
                                <label className="control-panel__label">Padding:</label>
                                <input
                                    type="number"
                                    className="control-panel__input"
                                    value={currentBlock.padding || 5}
                                    onChange={(e) => updateBlockProperty("padding", Math.max(0, Number(e.target.value)))}
                                />
                            </div>



                            <button onClick={deleteCurrentBlock} style={{ marginTop: '10px' }}>Delete</button>
                            <button onClick={mergeSelectedCells} style={{ marginTop: '10px' }}>Merge Cells</button>

                            {selectedCells.length > 0 && (
                                <button onClick={hideSelectedCells} style={{ marginTop: '10px' }}>
                                    Hide selected cells
                                </button>
                            )}
                            {currentBlock && currentBlock.hiddenCells && currentBlock.hiddenCells.length > 0 && (
                                <button onClick={showAllHiddenCells} style={{ marginTop: '10px' }}>
                                    Show hidden cells
                                </button>
                            )}




                        </div>
                    ) : (
                        <p>Select a collage to customize</p>
                    )}
                </aside>

                <div
                    ref={workingField}
                    className="working-field"
                    onMouseDown={currentAction === "block" ? addBlockCollage : undefined}
                >
                    {blocks.map((block) => (
                        <div
                            key={block.id}
                            className={`collage collage-${block.id}`}
                            style={{
                                position: 'absolute',
                                top: block.top,
                                left: block.left,
                                width: `${block.width}px`,
                                height: `${block.height}px`,
                                display: block.gridX >= 2 || block.gridY >= 2 ? 'grid' : 'block',
                                gridTemplateColumns: block.gridX >= 2 ? `repeat(${block.gridX}, 1fr)` : undefined,
                                gridTemplateRows: block.gridY >= 2 ? `repeat(${block.gridY}, 1fr)` : undefined,
                                gap: `${block.gridGap}px`,
                                backgroundColor: block.backgroundColor || 'white',
                                border: currentBlock && currentBlock.id === block.id ? '2px solid dodgerblue' : 'none',
                                cursor: 'move',
                                padding: `${block.padding || 5}px`
                            }}
                            onMouseDown={(e) => handleDragStart(e, block)}
                        >   {resizeElements(block)}
                            {block.gridX >= 2 || block.gridY >= 2 ? (
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: `repeat(${block.gridX}, 1fr)`,
                                        gridTemplateRows: `repeat(${block.gridY}, 1fr)`,
                                        gap: `${block.gridGap}px`,
                                        width: `${block.width - (block.padding)*2}px`,
                                        height: `${block.height - (block.padding)*2}px`,
                                        boxSizing: 'border-box',
                                    }}
                                >
                                    {renderGridCells(block)}
                                </div>
                            ) : null}






                        </div>
                    ))}
                </div>

                <div className="panel">
                    <div ref={cursorAction} className="panel__item item-cursor" onClick={(e) => {
                        chooseNewActionBtnDesign(e);
                        setCurrentAction("cursor");
                    }}>
                        <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M3 3L10 22L12.0513 15.8461C12.6485 14.0544 14.0544 12.6485 15.846 12.0513L22 10L3 3Z" stroke="black" strokeLinejoin="round" strokeWidth="1.3"/></svg>
                    </div>
                    <div className="panel__item" onClick={(e) => {
                        chooseNewActionBtnDesign(e);
                        setCurrentAction("block");
                    }}>
                        <div></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

