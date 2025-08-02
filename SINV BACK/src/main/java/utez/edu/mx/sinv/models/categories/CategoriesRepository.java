package utez.edu.mx.sinv.models.categories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface CategoriesRepository extends JpaRepository<Categories, Long> {
    Optional<Categories> findById(Long id);

    Optional<Categories> findByName(String name);

    @Query("SELECT c FROM Categories c WHERE c.status = true")
    List<Categories> findAllActive();

    boolean existsByName(String name);
}