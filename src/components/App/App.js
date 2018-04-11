import React, { Component } from "react";
import ReactDrawer from "react-drawer";
import "./App.css";
import "react-drawer/lib/react-drawer.css";

import Setup from "../Setup/Setup";
import GameGrid from "../GameGrid/GameGrid";
import { Board } from "../Board/Board";
import InformationModal from "../InformationModal/InformationModal";

import { GoQuestion } from "react-icons/lib/go";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sideLength: null,
      difficulty: "",
      board: null,
      tiles: null,
      isPlaying: null,
      isFinished: false,
      didWin: null,
      modalIsOpen: false
    };
    this.changeDifficulty = this.changeDifficulty.bind(this);
    this.newGame = this.newGame.bind(this);
    this.tryAgain = this.tryAgain.bind(this);
    this.updateTileState = this.updateTileState.bind(this);
    this.handleFlipTile = this.handleFlipTile.bind(this);
    this.playMove = this.playMove.bind(this);
    this.onDrawerClose = this.onDrawerClose.bind(this);
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  changeDifficulty(level) {
    this.setState({ difficulty: level });
  }

  newGame(sideLength, numberOfBombs) {
    // check if this is the first play through
    const firstPlay = this.state.board === null;

    // get new tile states
    let newCols = [];
    for (let rowIndex = 0; rowIndex < sideLength; rowIndex++) {
      let newRows = [];
      for (let colIndex = 0; colIndex < sideLength; colIndex++) {
        newRows.push({ revealed: false, flagged: false });
      }
      newCols.push(newRows);
    }

    // reset state
    this.setState({
      sideLength: sideLength,
      board: new Board(sideLength, sideLength, numberOfBombs),
      isPlaying: true,
      isFinished: false,
      tiles: newCols
    });

    // wait 5 seconds before resetting win/lose status to make sure css for drawer keeps looking pretty
    setTimeout(callback => {
      if (!firstPlay && !this.state.isPlaying && !this.state.isFinished) {
        this.setState({ didWin: null });
      }
    }, 5000);
  }

  tryAgain() {
    this.newGame(this.state.sideLength, this.state.board.numberOfBombs);
  }

  updateTileState(rowIndex, colIndex, key, newState) {
    let currentTiles = this.state.tiles;
    currentTiles[rowIndex][colIndex][key] = newState;
    this.setState({ tiles: currentTiles });
  }

  handleFlipTile(rowIndex, colIndex) {
    let newBoard = this.state.board;
    newBoard.flipTile(rowIndex, colIndex);
    this.setState({
      board: newBoard
    });
  }

  playMove(rowIndex, columnIndex) {
    if (this.state.isPlaying) {
      // flip tile
      this.handleFlipTile(rowIndex, columnIndex);
      console.log("Current board: ");
      this.state.board.print();

      // losing condition
      if (this.state.board.playerBoard[rowIndex][columnIndex] === "B") {
        console.log("Game over!");
        this.setState({
          didWin: false,
          isFinished: true,
          isPlaying: false
        });
      } else if (this.state.board.hasSafeTiles() === false) {
        // winning condition
        console.log("You won!");
        this.setState({
          didWin: true,
          isFinished: true,
          isPlaying: false
        });

        // flip all remaining tiles by using the bomb board
        console.log(this.state.board.bombBoard);
        this.state.board.bombBoard.forEach((row, i) => {
          row.forEach((col, j) => {
            if (col === "B") {
              this.handleFlipTile(i, j);
            }
          });
        });
      } else {
        // continue playing
        console.log("Keep playing!");
      }
    } else {
      console.log("Game over! Press 'New Game' to start over.");
    }
  }

  onDrawerClose() {
    this.setState({ isFinished: false });
  }

  handleOpenModal() {
    this.setState({ modalIsOpen: true });
  }

  handleCloseModal() {
    this.setState({ modalIsOpen: false });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">
            Minesweepe<span className="blue">React</span>{" "}
            <GoQuestion onClick={this.handleOpenModal} />
          </h1>
        </header>
        <Setup
          changeDifficulty={this.changeDifficulty}
          difficulty={this.state.difficulty}
          onClick={this.newGame}
        />
        <GameGrid
          board={this.state.board}
          playMove={this.playMove}
          didWin={this.state.didWin}
          tiles={this.state.tiles}
          updateTile={this.updateTileState}
        />
        <ReactDrawer
          open={this.state.isFinished}
          onClose={this.onDrawerClose}
          position="bottom"
          noOverlay={true}
        >
          <div className={"React-drawer-div isWon-" + this.state.didWin}>
            <h2 onClick={this.tryAgain}>
              {this.state.didWin
                ? "You won! Click here to play again!"
                : "You lost. :( Click here to try again!"}
            </h2>
          </div>
        </ReactDrawer>
        <InformationModal isOpen={this.state.modalIsOpen} handleClose={this.handleCloseModal} />

      </div>
    );
  }
}

export default App;