import React, { JSX, useRef, useState } from "react"


interface Figure {
  squares: boolean[][],
  size: {
    h: number,
    w: number
  }
}

type TableProps = {
  tableSquare: Array<Array<boolean>>,
  setTableSquare: React.Dispatch<React.SetStateAction<boolean[][]>>,
  previewSquares: Array<Array<boolean>>,
  setPreviewSquares: React.Dispatch<React.SetStateAction<boolean[][]>>
}

export const CreateFigure = () => {
  const falseSquares = useRef<Array<Array<boolean>>>(Array.from({ length: 5 }, () => Array(5).fill(false)))
  const activeFigure = useRef<Figure | null>(null)
  const [squares, setSquares] = useState<Array<Array<boolean>>>(falseSquares.current)
  const [tableSquare, setTableSquare] = useState<Array<Array<boolean>>>(falseSquares.current)
  const [previewSquares, setPreviewSquares] = useState<Array<Array<boolean>>>(falseSquares.current)
  const lastPreviewPosition = useRef<{x: number|null, y:number|null}>({x: null, y:null})
  const [figures, setFigures] = useState<Figure[]>([])

  console.log("Render")

  const Figure = ({ figure }: { figure: Figure }) => {
    const grid: JSX.Element[] = [];

    const startDrag = (event: React.DragEvent) => {
      event.dataTransfer.setData("application/json", JSON.stringify(figure))

      activeFigure.current = figure
      console.log(event.target)
    }

    const endDrag = (event: React.DragEvent) => {
      event.preventDefault()

      activeFigure.current = null
      setPreviewSquares(falseSquares.current)
      console.log("End")
    }

    figure.squares.forEach((squaresRow, indexRow) => {
      squaresRow.forEach((square, indexCol) => {
        grid.push(
          <div
            draggable={square}
            onDragStart={startDrag}
            onDragEnd={endDrag}
            key={`${indexRow}-${indexCol}`}
            className={`w-10 h-10 border ${square ? 'bg-amber-500 border-gray-900' : 'bg-white border-transparent'
              }`}
          />
        );
      })
    })


    return (
      <div
        className={`grid gap-1 w-max h-max`}
        style={{
          gridTemplateColumns: `repeat(${figure.size.w}, 2.5rem)`,
        }}
      >
        {grid}
      </div>
    );
  }

  const Table = ({ tableSquare, setTableSquare, previewSquares, setPreviewSquares }: TableProps) => {

    const insertFigure = (figure: Figure, y: number, x: number) => {

      setTableSquare(prev => {
        const newTableSquares = structuredClone(prev)

        figure.squares.forEach((squareRow, indexRow) => {
          squareRow.forEach((square, indexCol) => {
            if (square && newTableSquares.length > (indexRow + y) && newTableSquares[0].length > (indexCol + x)) {
              console.log("square en ", indexRow + y, indexCol + x)
              newTableSquares[indexRow + y][indexCol + x] = true
            }
          })
        })

        return newTableSquares
      })
    }

    const insertPreview = (figure: Figure, y: number, x: number) => {

      if (y === lastPreviewPosition.current.y && x === lastPreviewPosition.current.x) return

      lastPreviewPosition.current = {x:x, y:y}

      setPreviewSquares(() => {
        const newTableSquares = structuredClone(falseSquares.current)

        figure.squares.forEach((squareRow, indexRow) => {
          squareRow.forEach((square, indexCol) => {
            if (square && newTableSquares.length > (indexRow + y) && newTableSquares[0].length > (indexCol + x)) {
              console.log("square en ", indexRow + y, indexCol + x)
              newTableSquares[indexRow + y][indexCol + x] = true
            }
          })
        })

        return newTableSquares
      })
    }

    const handleDrop = (event: React.DragEvent, y: number, x: number) => {
      event.preventDefault()

      if (activeFigure.current) {
        setPreviewSquares(falseSquares.current)
        insertFigure(activeFigure.current, y, x)
      }

      console.log("drop en ", x, y)
    }

    const handleDragOver = (event: React.DragEvent, y: number, x: number) => {
      event.preventDefault()
      if (activeFigure.current) {
        insertPreview(activeFigure.current, y, x)
        
      }
    }

    const handleDragLeave = (event: React.DragEvent) => {
      event.preventDefault()
      setPreviewSquares(falseSquares.current)
      console.log("Leave")

    }

    return (
      <div className="border bg-green-300 w-full h-full flex items-center justify-center">
        <div className="grid grid-cols-5 w-max h-max gap-1">
          {tableSquare.map((squareRow, indexRow) => (
            squareRow.map((square, indexCol) => {
              return (
                <div
                  key={`${indexRow}-${indexCol}`}
                  onDrop={(e) => handleDrop(e, indexRow, indexCol)}
                  onDragOver={(e) => handleDragOver(e, indexRow, indexCol)}
                  onDragLeave={(e) => handleDragLeave(e)}
                  className={`border w-10 h-10 border-gray-900 ${square? "bg-amber-500" : previewSquares[indexRow][indexCol] && "bg-amber-200"} ${square && previewSquares[indexRow][indexCol] && "bg-red-600"}`} />
              )
            })

          ))}
        </div>
      </div>
    )
  }



  const handleClickSquare = (indexRow: number, index: number) => {
    setSquares(prevSquares => {
      const newSquares = structuredClone(prevSquares);
      newSquares[indexRow][index] = !newSquares[indexRow][index];
      return newSquares;
    });
  }

  const handleCreateFigure = () => {
    if (squares.some(squareRow => squareRow.some(square => square))) {
      createFigure()
      resetSquares()
    }

  }

  const getFigureSize = (squares: boolean[][]) => {
    let minRow = Infinity
    let maxRow = 0
    let minCol = Infinity
    let maxCol = 0

    squares.forEach((squaresRow, indexRow) => {
      if (squaresRow.some((square) => square)) {
        if (indexRow < minRow) minRow = indexRow
        if (indexRow > maxRow) maxRow = indexRow
      }

      squaresRow.forEach((square, indexCol) => {
        if (square) {
          if (indexCol < minCol) minCol = indexCol

          if (indexCol > maxCol) maxCol = indexCol
        }
      })
    })

    return {
      w: maxCol - minCol + 1,
      h: maxRow - minRow + 1,
      minCol,
      minRow
    }
  }

  const createFigure = () => {
    const size = getFigureSize(squares)

    const figureSquares = Array.from({ length: size.h }, () => Array(size.w).fill(false)).map((squareRow, indexRow) => (
      squareRow.map((square, index) => (
        square = squares[indexRow + size.minRow][index + size.minCol]
      ))
    ))

    console.log("Size: ", size)
    console.log("Squares: ", figureSquares)

    setFigures(prev => [
      ...prev, {
        squares: [...figureSquares],
        size: {
          h: size.h,
          w: size.w
        }
      }
    ])

  }


  const resetSquares = () => {
    setSquares(falseSquares.current)
  }





  return (
    <div className="grid-container w-full p-5">
      <section className="border m-auto flex flex-col items-center p-2 w-9/10 h-160 overflow-auto " style={{ gridArea: "figure" }}>
        <ul className="w-full flex flex-col">
          {figures.map((figure, index) => (
            <li key={index} className={`mt-10 p-0 m-0 flex items-center justify-center`}>
              <Figure figure={figure} />
            </li>
          ))}
        </ul>
      </section>

      <section className="w-full h-full mt-2 flex flex-col items-center gap-4" style={{ gridArea: "create" }}>
        <div className="grid grid-cols-5 w-max h-max gap-1">
          {squares.map((squareRow, indexRow) => (
            squareRow.map((square, index) => {
              return (
                <div key={`${indexRow}-${index}`} onClick={() => handleClickSquare(indexRow, index)} className={`border w-10 h-10 border-gray-900 ${square && "bg-amber-500"}`}>
                </div>
              )
            })

          ))}
        </div>
        <button onClick={handleCreateFigure}>Crear</button>
      </section>
      <section className="w-full h-full" style={{ gridArea: "table" }}>
        <Table
          tableSquare={tableSquare}
          setTableSquare={setTableSquare}
          previewSquares={previewSquares}
          setPreviewSquares={setPreviewSquares}
        />
      </section>
    </div>

  )
}
