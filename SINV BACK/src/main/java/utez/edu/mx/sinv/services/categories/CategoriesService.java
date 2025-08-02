package utez.edu.mx.sinv.services.categories;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utez.edu.mx.sinv.config.ApiResponse;
import utez.edu.mx.sinv.controllers.categories.dto.CategoriesDto;
import utez.edu.mx.sinv.models.categories.Categories;
import utez.edu.mx.sinv.models.categories.CategoriesRepository;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CategoriesService {
    private final CategoriesRepository repository;

    public CategoriesService(CategoriesRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse> findAll() {
        return new ResponseEntity<>(
                new ApiResponse(repository.findAll(), HttpStatus.OK),
                HttpStatus.OK);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse> findActiveCategories() {
        return new ResponseEntity<>(
                new ApiResponse(repository.findAllActive(), HttpStatus.OK),
                HttpStatus.OK);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse> findById(Long id) {
        Optional<Categories> category = repository.findById(id);
        return category.map(value -> new ResponseEntity<>(
                        new ApiResponse(value, HttpStatus.OK),
                        HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(
                        new ApiResponse("Category not found", HttpStatus.NOT_FOUND),
                        HttpStatus.NOT_FOUND));
    }

    @Transactional
    public ResponseEntity<ApiResponse> save(CategoriesDto dto) {
        if (repository.existsByName(dto.getName())) {
            return new ResponseEntity<>(
                    new ApiResponse("Category already exists", HttpStatus.BAD_REQUEST),
                    HttpStatus.BAD_REQUEST);
        }

        Categories category = dto.toEntity();
        category = repository.save(category);
        return new ResponseEntity<>(
                new ApiResponse(category, HttpStatus.CREATED),
                HttpStatus.CREATED);
    }

    @Transactional
    public ResponseEntity<ApiResponse> update(CategoriesDto dto) {
        if (!repository.existsById(dto.getId())) {
            return new ResponseEntity<>(
                    new ApiResponse("Category not found", HttpStatus.NOT_FOUND),
                    HttpStatus.NOT_FOUND);
        }

        Categories category = dto.toEntity();
        category = repository.save(category);
        return new ResponseEntity<>(
                new ApiResponse(category, HttpStatus.OK),
                HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<ApiResponse> changeStatus(Long id) {
        Optional<Categories> optionalCategory = repository.findById(id);
        if (optionalCategory.isEmpty()) {
            return new ResponseEntity<>(
                    new ApiResponse("Category not found", HttpStatus.NOT_FOUND),
                    HttpStatus.NOT_FOUND);
        }

        Categories category = optionalCategory.get();
        category.setStatus(!category.getStatus());
        repository.save(category);
        return new ResponseEntity<>(
                new ApiResponse(category, HttpStatus.OK),
                HttpStatus.OK);
    }
}