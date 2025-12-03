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
        available_moves = [i for i, spot in enumerate(game.cells) if cell not in ['X', 'O']]
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
        
