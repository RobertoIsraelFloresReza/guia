package utez.edu.mx.sinv.models.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import utez.edu.mx.sinv.models.role.Role;
import utez.edu.mx.sinv.models.storage.Storage;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50, nullable = false, unique = true)
    private String username;

    @Column(length = 100, nullable = false)
    private String fullName;

    @Column(length = 45, nullable = false, unique = true)
    private String email;

    @Column(length = 150, nullable = false)
    private String password;

    @Column(columnDefinition = "BOOL DEFAULT true")
    private Boolean status = true;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    @OneToOne(mappedBy = "responsible")
    @JsonIgnore
    private Storage managedStorage;


    public Users(String username, String fullName, String email, String encode, boolean b) {
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.password = encode;
        this.status = b;
    }
}