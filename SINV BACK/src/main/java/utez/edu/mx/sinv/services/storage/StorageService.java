package utez.edu.mx.sinv.services.storage;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utez.edu.mx.sinv.config.ApiResponse;
import utez.edu.mx.sinv.controllers.storage.dto.StorageDto;
import utez.edu.mx.sinv.models.categories.Categories;
import utez.edu.mx.sinv.models.categories.CategoriesRepository;
import utez.edu.mx.sinv.models.storage.Storage;
import utez.edu.mx.sinv.models.storage.StorageRepository;
import utez.edu.mx.sinv.models.user.Users;
import utez.edu.mx.sinv.models.user.UsersRepository;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class StorageService {
    private final StorageRepository repository;
    private final CategoriesRepository categoriesRepository;
    private final UsersRepository usersRepository;

    public StorageService(StorageRepository repository,
                          CategoriesRepository categoriesRepository,
                          UsersRepository usersRepository) {
        this.repository = repository;
        this.categoriesRepository = categoriesRepository;
        this.usersRepository = usersRepository;
    }

    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse> findAll() {
        return new ResponseEntity<>(
                new ApiResponse(repository.findAll(), HttpStatus.OK),
                HttpStatus.OK);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse> findById(Long id) {
        Optional<Storage> storage = repository.findById(id);
        return storage.map(value -> new ResponseEntity<>(
                        new ApiResponse(value, HttpStatus.OK),
                        HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(
                        new ApiResponse("Storage not found", HttpStatus.NOT_FOUND),
                        HttpStatus.NOT_FOUND));
    }

    @Transactional
    public ResponseEntity<ApiResponse> save(StorageDto dto) {
        // Validar identificador único
        if (repository.existsByIdentifier(dto.getIdentifier())) {
            return new ResponseEntity<>(
                    new ApiResponse("Storage identifier already exists", HttpStatus.BAD_REQUEST),
                    HttpStatus.BAD_REQUEST);
        }

        // Validar categoría
        Optional<Categories> category = categoriesRepository.findById(dto.getCategoryId());
        if (category.isEmpty()) {
            return new ResponseEntity<>(
                    new ApiResponse("Category not found", HttpStatus.BAD_REQUEST),
                    HttpStatus.BAD_REQUEST);
        }

        // Validar responsable (si se proporciona)
        Users responsible = null;
        if (dto.getResponsibleId() != null) {
            Optional<Users> user = usersRepository.findById(dto.getResponsibleId());
            if (user.isEmpty()) {
                return new ResponseEntity<>(
                        new ApiResponse("Responsible user not found", HttpStatus.BAD_REQUEST),
                        HttpStatus.BAD_REQUEST);
            }
            responsible = user.get();

            // Validar que el usuario no esté ya asignado a otro almacén
            if (repository.findByResponsibleId(dto.getResponsibleId()).isPresent()) {
                return new ResponseEntity<>(
                        new ApiResponse("User is already responsible for another storage", HttpStatus.BAD_REQUEST),
                        HttpStatus.BAD_REQUEST);
            }
        }

        Storage storage = dto.toEntity();
        storage = repository.save(storage);
        return new ResponseEntity<>(
                new ApiResponse(storage, HttpStatus.CREATED),
                HttpStatus.CREATED);
    }

    @Transactional
    public ResponseEntity<ApiResponse> update(StorageDto dto) {
        if (!repository.existsById(dto.getId())) {
            return new ResponseEntity<>(
                    new ApiResponse("Storage not found", HttpStatus.NOT_FOUND),
                    HttpStatus.NOT_FOUND);
        }

        // Validaciones similares a save()
        Optional<Categories> category = categoriesRepository.findById(dto.getCategoryId());
        if (category.isEmpty()) {
            return new ResponseEntity<>(
                    new ApiResponse("Category not found", HttpStatus.BAD_REQUEST),
                    HttpStatus.BAD_REQUEST);
        }

        Storage storage = dto.toEntity();
        storage = repository.save(storage);
        return new ResponseEntity<>(
                new ApiResponse(storage, HttpStatus.OK),
                HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<ApiResponse> changeStatus(Long id) {
        Optional<Storage> optionalStorage = repository.findById(id);
        if (optionalStorage.isEmpty()) {
            return new ResponseEntity<>(
                    new ApiResponse("Storage not found", HttpStatus.NOT_FOUND),
                    HttpStatus.NOT_FOUND);
        }

        Storage storage = optionalStorage.get();
        storage.setStatus(!storage.getStatus());
        repository.save(storage);
        return new ResponseEntity<>(
                new ApiResponse(storage, HttpStatus.OK),
                HttpStatus.OK);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse> findByResponsible(Long userId) {
        Optional<Storage> storage = repository.findByResponsibleId(userId);
        return storage.map(value -> new ResponseEntity<>(
                        new ApiResponse(value, HttpStatus.OK),
                        HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(
                        new ApiResponse("No storage assigned to this user", HttpStatus.NOT_FOUND),
                        HttpStatus.NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse> findByCategory(Long categoryId) {
        List<Storage> storages = repository.findByCategoryId(categoryId);
        return new ResponseEntity<>(
                new ApiResponse(storages, HttpStatus.OK),
                HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<ApiResponse> assignStorageToUser(Long userId, Long storageId) {
        Optional<Users> user = usersRepository.findById(userId);
        if (user.isEmpty()) {
            return new ResponseEntity<>(
                    new ApiResponse("User not found", HttpStatus.BAD_REQUEST),
                    HttpStatus.BAD_REQUEST);
        }

        Optional<Storage> storage = repository.findById(storageId);
        if (storage.isEmpty()) {
            return new ResponseEntity<>(
                    new ApiResponse("Storage not found", HttpStatus.BAD_REQUEST),
                    HttpStatus.BAD_REQUEST);
        }

        // Verificar si el usuario ya es responsable de otro almacén
        if (repository.findByResponsibleId(userId).isPresent()) {
            return new ResponseEntity<>(
                    new ApiResponse("User is already responsible for another storage", HttpStatus.BAD_REQUEST),
                    HttpStatus.BAD_REQUEST);
        }

        Storage existingStorage = storage.get();
        existingStorage.setResponsible(user.get());
        repository.save(existingStorage);

        return new ResponseEntity<>(
                new ApiResponse(existingStorage, HttpStatus.OK),
                HttpStatus.OK);
    }


}