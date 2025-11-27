from random import randrange

WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
]

board = [" "] * 9
winner = None

def check_winner():
    for combination in WINNING_COMBINATIONS:
        if board[combination[0]] == board[combination[1]] == board[combination[2]] != "":
            return board[combination[0]]
    
    if " " not in board:
        return "Tie"

    return None

def check_valid_move(player_move):
    try:
        if board[player_move] == " ":
            return True
        else:
            return False
    except:
        print("Invalid move. Please try again.")
        return False


def board_update(player_move, current_player):
    if check_valid_move(player_move):
        board[player_move] = current_player

        game_won = check_winner()

        if game_won == current_player:
            print(f"Player {current_player} wins!")
            return game_won
        elif game_won == "Tie":
            print("The game is a tie!")
            return game_won
    
    else:
        print("Invalid move. Please try again.")
        

   

def check_player_id(current_player):
    if current_player == "X":
        player_move = bot1_move()
    else:
        player_move = bot2_move()
    return player_move

def bot1_move():
    bot1_move = randrange(9)
    return bot1_move

bot2_first_move = None

def bot2_move():
    global bot2_first_move
    if bot2_first_move is None:
        bot2_first_move = randrange(9)
        return bot2_first_move
    else:
        return bot2_first_move


def render_board():
    print("\n-------------")
    for i in range(0, 9, 3):
        print("|", " | ".join(board[i:i+3]), "|" )
        print("-------------\n")


if __name__ == '__main__':
    print("Welcome to Tic Tac Toe!")

    render_board()

    current_player = "X"

    while winner is None:
        player_move = check_player_id(current_player)
        winner_status = board_update(player_move, current_player)
        render_board()

        if winner_status is not None:
            break

        current_player = "O" if current_player == "X" else "X"