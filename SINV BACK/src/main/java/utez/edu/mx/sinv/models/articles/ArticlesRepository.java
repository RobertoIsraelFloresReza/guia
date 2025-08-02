package utez.edu.mx.sinv.models.articles;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import utez.edu.mx.sinv.models.storage.Storage;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface ArticlesRepository extends JpaRepository<Articles, Long> {
    Optional<Articles> findById(Long id);

    // Reemplazado por consulta alternativa
    @Query("SELECT a FROM Articles a JOIN a.storages s WHERE s.id = :storageId")
    List<Articles> findByStorageId(@Param("storageId") Long storageId);

    List<Articles> findByCategoryId(Long categoryId);

    @Query("SELECT a FROM Articles a JOIN a.storages s WHERE s.id = :storageId AND a.category.id = :categoryId")
    List<Articles> findByStorageAndCategory(
            @Param("storageId") Long storageId,
            @Param("categoryId") Long categoryId
    );

    // Consulta para verificar si existe un artículo con el mismo nombre (sin importar el almacén)
    boolean existsByName(String name);

    // Consulta para verificar si un artículo está en un almacén específico
    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END " +
            "FROM Articles a JOIN a.storages s WHERE a.name = :name AND s.id = :storageId")
    boolean existsByNameInStorage(@Param("name") String name, @Param("storageId") Long storageId);

    // Encontrar artículos por múltiples almacenes
    @Query("SELECT DISTINCT a FROM Articles a JOIN a.storages s WHERE s.id IN :storageIds")
    List<Articles> findByStorages(@Param("storageIds") Set<Long> storageIds);

    // Encontrar artículos por categoría y múltiples almacenes
    @Query("SELECT DISTINCT a FROM Articles a JOIN a.storages s " +
            "WHERE a.category.id = :categoryId AND s.id IN :storageIds")
    List<Articles> findByCategoryAndStorages(
            @Param("categoryId") Long categoryId,
            @Param("storageIds") Set<Long> storageIds
    );
}