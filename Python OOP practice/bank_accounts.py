class BalanceException(Exception):
    pass

class BankAccount:
    def __init__(self, initialAmount, acctName):
        self.balance = initialAmount
        self.name = acctName
        print(f"\nAccount for {self.name} created with initial balance of ${self.balance:.2f}")


    def getBalance(self):
        print(f"\nAccount balance for {self.name} is ${self.balance:.2f}")
        
    def deposit(self, amount):
        self.balance += amount
        print("Deposit accepted")
        self.getBalance()

    def viableTransaction(self, amount):
        if self.balance >= amount:
            return 
        else:
            raise BalanceException(f"\n Sorry, {self.name}, you have insufficient funds for this transaction. Your current balance is ${self.balance:.2f}")
        
    def withdraw(self, amount):
        try:
            self.viableTransaction(amount)
            self.balance -= amount
            print("Withdrawal accepted")
            self.getBalance()
        except BalanceException as error:
            print(f"\n withdraw interrupted: {error}")