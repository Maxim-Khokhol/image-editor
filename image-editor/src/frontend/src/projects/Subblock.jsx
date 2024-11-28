import React from 'react';
import "../App.css";

export function Subblock({
                             index,
                             mergedCell,
                             selectedCells,
                             cellHasImage,
                             block,
                             handleCellClick,
                             handleDragImage,
                             handleImageClick,
                             isFirstBlock
                         }) {
    return (
        <div
            className={`subblock-${index} subblock${selectedCells.includes(index) ? "-hover" : ""}`}
            style={{
                gridRow: isFirstBlock ? `span ${mergedCell.endRow - mergedCell.startRow + 1}` : undefined,
                gridColumn: isFirstBlock ? `span ${mergedCell.endCol - mergedCell.startCol + 1}` : undefined,
                backgroundColor: cellHasImage ? 'transparent' : "rgba(248, 245, 239)",
                position: 'relative',
                overflow: 'hidden',
                pointerEvents: cellHasImage ? 'none' : 'auto',
                border: selectedCells.includes(index) ? '2px solid blue' : '1px dashed lightsteelblue',
            }}
            onClick={() => !cellHasImage && handleCellClick(index)}
        >
            <img
                className="download__svg"
                src={cellHasImage ? block.images[index]?.src : "../src/assets/download.svg"}
                alt="download svg"
                style={{
                    position: 'absolute',
                    width: cellHasImage
                        ? (block.images[index]?.width < block.images[index]?.height ? "100%" : 'auto')
                        : '20px',
                    height: cellHasImage
                        ? (block.images[index]?.width > block.images[index]?.height ? "100%" : 'auto')
                        : 'auto',
                    left: cellHasImage ? 0 : '50%',
                    top: cellHasImage ? 0 : '50%',
                    transform: cellHasImage ? 'none' : 'translate(-50%, -50%)',
                    cursor: cellHasImage ? 'move' : 'pointer',
                }}
                onMouseDown={(e) => cellHasImage && handleDragImage(e, index)}
                onClick={(e) => {
                    if (!cellHasImage) {
                        e.stopPropagation();
                        handleImageClick(index);
                    }
                }}
            />
        </div>
    );
}
