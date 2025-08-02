package utez.edu.mx.sinv.services;

public interface EmailService {
    void sendPasswordResetEmail(String emailTo, String token);
}
