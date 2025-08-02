package utez.edu.mx.sinv.models.passwordreset;

import utez.edu.mx.sinv.models.user.Users;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Data
@NoArgsConstructor
@Entity
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String token;

    @ManyToOne
    @JoinColumn(name = "userId", nullable = false)
    private Users user;

    private Date expiryDate;

    private boolean used;
}