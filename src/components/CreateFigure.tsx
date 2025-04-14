import React, { JSX, useRef, useState } from "react"


interface Figure {
  squares: boolean[][],
  size : {
    h: number,
    w: number
  }
}

export const CreateFigure = () => {
    const falseSquares = useRef(Array.from({length: 5}, ()=> Array(5).fill(false)))
    const [squares, setSquares] = useState<Array<Array<boolean>>>(falseSquares.current)
    const [figures, setFigures] = useState<Figure[]>([])

    const Figure = ({figure}:{figure:Figure}) =>{
    const grid: JSX.Element[] = [];

      figure.squares.forEach((squaresRow, indexRow) => {
        squaresRow.forEach((square, indexCol) => {
          grid.push(
            <div
              key={`${indexRow}-${indexCol}`}
              className={`w-10 h-10 border ${
                square ? 'bg-amber-500 border-gray-900' : 'bg-white border-transparent'
              }`}
            />
          );
        })
      })
      

      return (
        <div
          draggable = {true}
          onDragStart={startDrag}
          className={`grid gap-1 w-max h-max`}
          style={{
            gridTemplateColumns: `repeat(${figure.size.w}, 2.5rem)`,
          }}
        >
          {grid}
        </div>
      );
    }

    const Table = () => {
      return (
        <div className="border w-full h-full">

        </div>
      )
    }

    const startDrag = (event:React.DragEvent) => {
      event.target
      console.log(event.target)
    }

    const handleClickSquare = (indexRow:number,index:number) =>{
      setSquares(prevSquares => {
        const newSquares = structuredClone(prevSquares);
        newSquares[indexRow][index] = !newSquares[indexRow][index];
        return newSquares;
      });
    }

    const handleCreateFigure = () =>{
      createFigure()
      resetSquares()

    }

    const getFigureSize = (squares: boolean[][]) => {
      let minRow = Infinity
      let maxRow = 0
      let minCol = Infinity
      let maxCol = 0

      squares.forEach((squaresRow, indexRow) => {
        if(squaresRow.some((square) => square)) {
          if(indexRow < minRow) minRow = indexRow
          if(indexRow > maxRow) maxRow = indexRow
        }

        squaresRow.forEach((square, indexCol) => {
          if(square){
            if(indexCol < minCol) minCol = indexCol

            if(indexCol > maxCol) maxCol = indexCol
          }
        })
      })

      return {
        w: maxCol-minCol + 1,
        h: maxRow-minRow +1,
        minCol,
        minRow
      }
    }

    const createFigure = () => {
      const size = getFigureSize(squares)

      const figureSquares = Array.from({length: size.h}, ()=> Array(size.w).fill(false)).map((squareRow, indexRow)=>(
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


    console.log("Figures: ", figures)

  return (
    <div className="grid-container w-full p-5">
      <section className="border m-auto flex flex-col items-center p-2 w-9/10 h-160 overflow-auto " style={{gridArea: "figure"}}>
        <ul className="w-full flex flex-col">
          {figures.map((figure, index) => (
            <li key={index} className={`mt-10 p-0 m-0 flex items-center justify-center`}>
              <Figure figure={figure}/>
            </li>
          ))}
        </ul>
      </section>

      <section className="w-full h-full mt-2 flex flex-col items-center gap-4" style={{gridArea: "create"}}>
        <div className="grid grid-cols-5 w-max h-max gap-1">
          {squares.map((squareRow, indexRow)=>(
            squareRow.map((square, index)  => {
              return (
                <div key={`${indexRow}-${index}`} onClick={() => handleClickSquare(indexRow, index)} className={`border w-10 h-10 border-gray-900 ${square && "bg-amber-500"}`}>
                </div>
              )
            })
              
          ))} 
        </div>
        <button onClick={handleCreateFigure}>Crear</button>
      </section>
      <section className="w-full h-full" style={{gridArea: "table"}}>
        <Table />
      </section>
    </div>
    
  )
}
