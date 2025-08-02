package utez.edu.mx.sinv.services.articles;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utez.edu.mx.sinv.config.ApiResponse;
import utez.edu.mx.sinv.controllers.articles.dto.ArticleResponseDto;
import utez.edu.mx.sinv.controllers.articles.dto.ArticlesDto;
import utez.edu.mx.sinv.controllers.articles.dto.CategorySimpleDto;
import utez.edu.mx.sinv.controllers.articles.dto.StorageSimpleDto;
import utez.edu.mx.sinv.models.articles.Articles;
import utez.edu.mx.sinv.models.articles.ArticlesRepository;
import utez.edu.mx.sinv.models.categories.Categories;
import utez.edu.mx.sinv.models.categories.CategoriesRepository;
import utez.edu.mx.sinv.models.storage.Storage;
import utez.edu.mx.sinv.models.storage.StorageRepository;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class ArticlesService {
    private final ArticlesRepository repository;
    private final CategoriesRepository categoriesRepository;
    private final StorageRepository storageRepository;

    public ArticlesService(ArticlesRepository repository,
                           CategoriesRepository categoriesRepository,
                           StorageRepository storageRepository) {
        this.repository = repository;
        this.categoriesRepository = categoriesRepository;
        this.storageRepository = storageRepository;
    }

    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse> findAll() {
        return new ResponseEntity<>(
                new ApiResponse(repository.findAll(), HttpStatus.OK),
                HttpStatus.OK);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse> findById(Long id) {
        Optional<Articles> article = repository.findById(id);
        return article.map(value -> new ResponseEntity<>(
                        new ApiResponse(value, HttpStatus.OK),
                        HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(
                        new ApiResponse("Article not found", HttpStatus.NOT_FOUND),
                        HttpStatus.NOT_FOUND));
    }

    @Transactional
    public ResponseEntity<ApiResponse> save1(ArticlesDto dto) {
        // Validar que la categoría existe
        Optional<Categories> category = categoriesRepository.findById(dto.getCategoryId());
        if (category.isEmpty()) {
            return new ResponseEntity<>(
                    new ApiResponse("Category not found", HttpStatus.BAD_REQUEST),
                    HttpStatus.BAD_REQUEST);
        }

        // Validar que el artículo no exista con el mismo nombre
        if (repository.existsByName(dto.getName())) {
            return new ResponseEntity<>(
                    new ApiResponse("Article with this name already exists", HttpStatus.BAD_REQUEST),
                    HttpStatus.BAD_REQUEST);
        }

        Articles article = dto.toEntity();
        article.setCategory(category.get());

        // Si hay almacenes especificados, validarlos y asignarlos
        if (dto.getStorageIds() != null && !dto.getStorageIds().isEmpty()) {
            List<Storage> storages = storageRepository.findAllById(dto.getStorageIds());

            // Verificar que todos los almacenes existan
            if (storages.size() != dto.getStorageIds().size()) {
                return new ResponseEntity<>(
                        new ApiResponse("One or more storages not found", HttpStatus.BAD_REQUEST),
                        HttpStatus.BAD_REQUEST);
            }

            // Verificar que las categorías coincidan
            for (Storage storage : storages) {
                if (!storage.getCategory().getId().equals(dto.getCategoryId())) {
                    return new ResponseEntity<>(
                            new ApiResponse("Article category doesn't match storage category for storage: "
                                    + storage.getId(), HttpStatus.BAD_REQUEST),
                            HttpStatus.BAD_REQUEST);
                }
            }

            article.setStorages((Set<Storage>) storages);
        }

        Articles savedArticle = repository.save(article);
        return new ResponseEntity<>(
                new ApiResponse(savedArticle, HttpStatus.CREATED),
                HttpStatus.CREATED);
    }

    @Transactional
    public ResponseEntity<ApiResponse> save(ArticlesDto dto) {
        // 1. Validar que la categoría existe
        Optional<Categories> category = categoriesRepository.findById(dto.getCategoryId());
        if (category.isEmpty()) {
            return new ResponseEntity<>(
                    new ApiResponse("Category not found", HttpStatus.BAD_REQUEST),
                    HttpStatus.BAD_REQUEST);
        }

        // 2. Validar que el artículo no exista con el mismo nombre
        if (repository.existsByName(dto.getName())) {
            return new ResponseEntity<>(
                    new ApiResponse("Article with this name already exists", HttpStatus.BAD_REQUEST),
                    HttpStatus.BAD_REQUEST);
        }

        // 3. Convertir DTO a entidad
        Articles article = dto.toEntity();
        article.setCategory(category.get());

        // 4. Manejar storages si están presentes
        if (dto.getStorageIds() != null && !dto.getStorageIds().isEmpty()) {
            List<Storage> storages = storageRepository.findAllById(dto.getStorageIds());

            // Validar que todos los almacenes existan
            if (storages.size() != dto.getStorageIds().size()) {
                return new ResponseEntity<>(
                        new ApiResponse("One or more storages not found", HttpStatus.BAD_REQUEST),
                        HttpStatus.BAD_REQUEST);
            }

            // Validar que las categorías coincidan
            for (Storage storage : storages) {
                if (!storage.getCategory().getId().equals(dto.getCategoryId())) {
                    return new ResponseEntity<>(
                            new ApiResponse("Article category doesn't match storage category for storage: "
                                    + storage.getId(), HttpStatus.BAD_REQUEST),
                            HttpStatus.BAD_REQUEST);
                }
            }

            article.setStorages(new HashSet<>(storages));
        }

        // 5. Guardar el artículo
        Articles savedArticle = repository.save(article);

        // 6. Convertir a DTO de respuesta para evitar referencia circular
        ArticleResponseDto responseDto = convertToArticleResponseDto(savedArticle);

        return new ResponseEntity<>(
                new ApiResponse(responseDto, HttpStatus.CREATED),
                HttpStatus.CREATED);
    }

    // Método auxiliar para convertir la entidad a DTO de respuesta
    private ArticleResponseDto convertToArticleResponseDto(Articles article) {
        ArticleResponseDto dto = new ArticleResponseDto();
        dto.setId(article.getId());
        dto.setName(article.getName());
        dto.setDescription(article.getDescription());
        dto.setStatus(article.getStatus());

        // Convertir categoría a DTO simple
        CategorySimpleDto categoryDto = new CategorySimpleDto();
        categoryDto.setId(article.getCategory().getId());
        categoryDto.setName(article.getCategory().getName());
        categoryDto.setStatus(article.getCategory().getStatus());
        dto.setCategory(categoryDto);

        // Convertir storages si existen
        if (article.getStorages() != null && !article.getStorages().isEmpty()) {
            Set<StorageSimpleDto> storageDtos = article.getStorages().stream()
                    .map(this::convertToStorageSimpleDto)
                    .collect(Collectors.toSet());
            dto.setStorages(storageDtos);
        }

        return dto;
    }

    // Método auxiliar para convertir Storage a DTO simple
    private StorageSimpleDto convertToStorageSimpleDto(Storage storage) {
        StorageSimpleDto dto = new StorageSimpleDto();
        dto.setId(storage.getId());
        dto.setIdentifier(storage.getIdentifier());
        dto.setStatus(storage.getStatus());
        return dto;
    }

    @Transactional
    public ResponseEntity<ApiResponse> update(ArticlesDto dto) {
        Optional<Articles> existingArticleOpt = repository.findById(dto.getId());
        if (existingArticleOpt.isEmpty()) {
            return new ResponseEntity<>(
                    new ApiResponse("Article not found", HttpStatus.NOT_FOUND),
                    HttpStatus.NOT_FOUND);
        }

        Articles existingArticle = existingArticleOpt.get();

        // Validar categoría
        Optional<Categories> category = categoriesRepository.findById(dto.getCategoryId());
        if (category.isEmpty()) {
            return new ResponseEntity<>(
                    new ApiResponse("Category not found", HttpStatus.BAD_REQUEST),
                    HttpStatus.BAD_REQUEST);
        }

        // Actualizar campos básicos
        existingArticle.setName(dto.getName());
        existingArticle.setDescription(dto.getDescription());
        existingArticle.setStatus(dto.getStatus() != null ? dto.getStatus() : true);
        existingArticle.setCategory(category.get());

        // Manejo de almacenes
        if (dto.getStorageIds() != null) {
            List<Storage> storages = storageRepository.findAllById(dto.getStorageIds());

            // Verificar que todos los almacenes existan
            if (storages.size() != dto.getStorageIds().size()) {
                return new ResponseEntity<>(
                        new ApiResponse("One or more storages not found", HttpStatus.BAD_REQUEST),
                        HttpStatus.BAD_REQUEST);
            }

            // Verificar categorías
            for (Storage storage : storages) {
                if (!storage.getCategory().getId().equals(dto.getCategoryId())) {
                    return new ResponseEntity<>(
                            new ApiResponse("Article category doesn't match storage category for storage: "
                                    + storage.getId(), HttpStatus.BAD_REQUEST),
                            HttpStatus.BAD_REQUEST);
                }
            }

            existingArticle.getStorages().clear();
            existingArticle.getStorages().addAll(storages);
        }

        Articles updatedArticle = repository.save(existingArticle);
        return new ResponseEntity<>(
                new ApiResponse(updatedArticle, HttpStatus.OK),
                HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<ApiResponse> changeStatus(Long id) {
        Optional<Articles> optionalArticle = repository.findById(id);
        if (optionalArticle.isEmpty()) {
            return new ResponseEntity<>(
                    new ApiResponse("Article not found", HttpStatus.NOT_FOUND),
                    HttpStatus.NOT_FOUND);
        }

        Articles article = optionalArticle.get();
        article.setStatus(!article.getStatus());
        repository.save(article);
        return new ResponseEntity<>(
                new ApiResponse(article, HttpStatus.OK),
                HttpStatus.OK);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse> findByStorage(Long storageId) {
        Optional<Storage> storage = storageRepository.findById(storageId);
        if (storage.isEmpty()) {
            return new ResponseEntity<>(
                    new ApiResponse("Storage not found", HttpStatus.NOT_FOUND),
                    HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(
                new ApiResponse(storage.get().getArticles(), HttpStatus.OK),
                HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<ApiResponse> assignToStorages(Long articleId, Set<Long> storageIds) {
        Optional<Articles> articleOpt = repository.findById(articleId);
        if (articleOpt.isEmpty()) {
            return new ResponseEntity<>(
                    new ApiResponse("Article not found", HttpStatus.NOT_FOUND),
                    HttpStatus.NOT_FOUND);
        }

        Articles article = articleOpt.get();
        List<Storage> storages = storageRepository.findAllById(storageIds);

        // Verificar que todos los almacenes existan
        if (storages.size() != storageIds.size()) {
            return new ResponseEntity<>(
                    new ApiResponse("One or more storages not found", HttpStatus.BAD_REQUEST),
                    HttpStatus.BAD_REQUEST);
        }

        // Verificar categorías
        for (Storage storage : storages) {
            if (!storage.getCategory().getId().equals(article.getCategory().getId())) {
                return new ResponseEntity<>(
                        new ApiResponse("Article category doesn't match storage category for storage: "
                                + storage.getId(), HttpStatus.BAD_REQUEST),
                        HttpStatus.BAD_REQUEST);
            }
        }

        article.getStorages().addAll(storages);
        repository.save(article);

        return new ResponseEntity<>(
                new ApiResponse("Article assigned to storages successfully", HttpStatus.OK),
                HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<ApiResponse> removeFromStorages(Long articleId, Set<Long> storageIds) {
        Optional<Articles> articleOpt = repository.findById(articleId);
        if (articleOpt.isEmpty()) {
            return new ResponseEntity<>(
                    new ApiResponse("Article not found", HttpStatus.NOT_FOUND),
                    HttpStatus.NOT_FOUND);
        }

        Articles article = articleOpt.get();
        Set<Storage> storagesToRemove = article.getStorages().stream()
                .filter(storage -> storageIds.contains(storage.getId()))
                .collect(Collectors.toSet());

        article.getStorages().removeAll(storagesToRemove);
        repository.save(article);

        return new ResponseEntity<>(
                new ApiResponse("Article removed from specified storages", HttpStatus.OK),
                HttpStatus.OK);
    }

    //borrar un artículo
    @Transactional
    public ResponseEntity<ApiResponse> delete(Long id) {
        Optional<Articles> articleOpt = repository.findById(id);
        if (articleOpt.isEmpty()) {
            return new ResponseEntity<>(
                    new ApiResponse("Article not found", HttpStatus.NOT_FOUND),
                    HttpStatus.NOT_FOUND);
        }

        Articles article = articleOpt.get();
        repository.delete(article);
        return new ResponseEntity<>(
                new ApiResponse("Article deleted successfully", HttpStatus.OK),
                HttpStatus.OK);
    }

}