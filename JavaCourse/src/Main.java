import java.security.KeyStore;
import java.util.Scanner;

public class Main {

    public static void main(String[] args){

        Scanner scanner = new Scanner(System.in);

        System.out.println("Enter name: ");
        String name = scanner.nextLine();

        System.out.println("enter age: ");
        int age = scanner.nextInt();

        System.out.println("hello " + name);
        System.out.println("you are " + age);

        scanner.close();
    }
}
