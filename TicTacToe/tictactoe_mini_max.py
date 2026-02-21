from random import randrange
import random

class Player:
    def __init__(self, marker):
        self.marker = marker

    def get_move(self, game):
        pass

class Random(Player):
    def get_move(self, game):
        return random.randint(0, 8)
    
class Random_efficient(Player):
    def get_move(self, game):
        available_moves = [i for i, cell in enumerate(game.cells) if cell not in ['X', 'O']]
        return random.choice(available_moves)
    
class MinimaxPlayer(Player):
    def get_move(self, game):
        best_score = float('-inf')
        best_move = None
        for move in range(9):
            if game.cells[move] not in ['X', 'O']:
                game.cells[move] = self.marker
                score = self.minimax(game, 0,False)
                game.cells[move] = str(move + 1)

                if score > best_score:
                    best_score = score
                    best_move = move
        return best_move
    
    def minimax(self, game, depth, is_maximizing):
        winner = game.check_winner()
        if winner == self.marker:
            return 10 - depth
        elif winner == "tie":
            return 0
        elif winner is not None:
            return depth - 10
    
        if is_maximizing:
            best_score = float('-inf')
            for move in range(9):
                if game.cells[move] not in ['X', 'O']:
                    game.cells[move] = self.marker
                    score = self.minimax(game, depth + 1, False)
                    game.cells[move] = str(move + 1)
                    best_score = max(score, best_score)
            return best_score
        
        else:
            best_score = float('inf')
            opponent_marker = 'O' if self.marker == 'X' else 'X'
            for move in range(9):
                if game.cells[move] not in ['X', 'O']:
                    game.cells[move] = opponent_marker
                    score = self.minimax(game, depth + 1, True)
                    game.cells[move] = str(move + 1)
                    best_score = min(score, best_score)
            return best_score
        
class TicTacToe:
    def __init__(self):
        self.cells = [str(i) for i in range(1, 10)]
        self.winner = None

    def render(self):
        print("\n-------------")
        for i in range(0, 9, 3):
            print(f"| {self.cells[i]} | {self.cells[i+1]} | {self.cells[i+2]} |")
            print("-------------")
        
    def game_start(self, player):
        valid = False
        while not valid:
            move = player.get_move(self)
            if self.cells[move] not in ['X', 'O']:
                self.cells[move] = player.marker
                valid = True
            else:
                print("Invalid move. Please try again.")

    def check_winner(self):
        winning_combinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],  # rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8],  # columns
            [0, 4, 8], [2, 4, 6]              # diagonals
        ]

        for a, b , c in winning_combinations:
            if self.cells[a] == self.cells[b] == self.cells[c]:
                return self.cells[a]
        
        if all(cell in ['X', 'O'] for cell in self.cells):
            return "tie"
        
        return None
    

if __name__ == "__main__":
    game = TicTacToe()
    player1 = MinimaxPlayer('X')
    player2 = Random_efficient('O')
    #player2 = Random('X')

    current_player = player1

    while game.winner is None:
        game.render()
        game.game_start(current_player)
        game.winner = game.check_winner()
        if game.winner:
            break
        current_player = player1 if current_player == player2 else player2

    game.render()
    if game.winner == "tie":
        print("The game is a tie!")
    else:
        print(f"Player {game.winner} wins!")