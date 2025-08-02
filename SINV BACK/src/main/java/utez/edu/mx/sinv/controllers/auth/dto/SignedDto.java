package utez.edu.mx.sinv.controllers.auth.dto;

import utez.edu.mx.sinv.models.role.Role;
import utez.edu.mx.sinv.models.user.Users;
import lombok.Value;

@Value
public class SignedDto {
    String token;
    String tokenType;
    Users user;
    Role roles;
}
