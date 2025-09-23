class BankAccount:
    def __init__(self, initialAmount, acctName):
        self.balance = initialAmount
        self.name = acctName
        print(f"\nAccount for {self.name} created with initial balance of ${self.balance:.2f}")


    def getBalance(self):
        print(f"\nAccount balance for {self.name} is ${self.balance:.2f}")
        