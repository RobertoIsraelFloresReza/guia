package utez.edu.mx.sinv.models.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UsersRepository extends JpaRepository<Users, Long> {
    Optional<Users> findById(Long id);

    Optional<Users> findByEmail(String email);

    Optional<Users> findByUsername(String username);

    @Query("SELECT u FROM Users u WHERE u.role.name = :roleName")
    List<Users> findByRoleName(@Param("roleName") String roleName);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}