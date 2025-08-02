package utez.edu.mx.sinv.models.storage;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StorageRepository extends JpaRepository<Storage, Long> {
    Optional<Storage> findById(Long id);

    Optional<Storage> findByIdentifier(String identifier);

    @Query("SELECT s FROM Storage s WHERE s.responsible.id = :userId")
    Optional<Storage> findByResponsibleId(@Param("userId") Long userId);

    @Query("SELECT s FROM Storage s WHERE s.category.id = :categoryId")
    List<Storage> findByCategoryId(@Param("categoryId") Long categoryId);

    boolean existsByIdentifier(String identifier);
}