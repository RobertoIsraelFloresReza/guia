package utez.edu.mx.sinv.controllers.users.dto;

import lombok.*;
import utez.edu.mx.sinv.models.role.Role;
import utez.edu.mx.sinv.models.user.Users;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UsersDto {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String password;
    private Boolean status;
    private Long roleId;

    public Users toEntity() {
        Users user = new Users();
        user.setId(this.id);
        user.setUsername(this.username);
        user.setFullName(this.fullName);
        user.setEmail(this.email);
        user.setPassword(this.password);
        user.setStatus(this.status != null ? this.status : true);

        if (this.roleId != null) {
            Role role = new Role();
            role.setId(this.roleId);
            user.setRole(role);
        }

        return user;
    }

    public static UsersDto fromEntity(Users user) {
        UsersDto dto = new UsersDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setStatus(user.getStatus());

        if (user.getRole() != null) {
            dto.setRoleId(user.getRole().getId());
        }

        return dto;
    }
}