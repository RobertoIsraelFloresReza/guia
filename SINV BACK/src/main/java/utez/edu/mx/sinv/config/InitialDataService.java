package utez.edu.mx.sinv.config;

import utez.edu.mx.sinv.models.role.Role;
import utez.edu.mx.sinv.models.role.RoleRepository;
import utez.edu.mx.sinv.models.user.Users;
import utez.edu.mx.sinv.models.user.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InitialDataService {

    private final RoleRepository roleRepository;
    private final UsersRepository usersRepository;
    private final PasswordEncoder encoder;

    @Transactional
    public void initializeRolesAndUsers() {
        Role adminRole = getOrSaveRole(new Role("ADMINISTRADOR"));
        Role workerRole = getOrSaveRole(new Role("TRABAJADOR"));

        createUserWithRole("Isri_Narvi_Good_010", "Israel Flores Reza", "20223tn016@utez.edu.mx", "admin", adminRole);
        createUserWithRole("Sebas_NovioDE_Nico","Sebastian Quintero Martinez", "20203tn049@utez.edu.mx", "trabajador", workerRole);
    }

    private void createUserWithRole( String username, String fullName,  String email, String password, Role role) {
        Users user = getOrSaveUsers(new Users(username, fullName, email, encoder.encode(password), true));
        user.setRole(role);
        usersRepository.save(user);
    }

    private Role getOrSaveRole(Role role) {
        return roleRepository.findByName(role.getName())
                .orElseGet(() -> roleRepository.saveAndFlush(role));
    }

    private Users getOrSaveUsers(Users user) {
        Optional<Users> foundUser = usersRepository.findByEmail(user.getEmail());
        if (foundUser.isPresent()) return foundUser.get();

        return usersRepository.saveAndFlush(user);
    }
}
