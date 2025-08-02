package utez.edu.mx.sinv.controllers.storage;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import utez.edu.mx.sinv.config.ApiResponse;
import utez.edu.mx.sinv.controllers.storage.dto.StorageDto;
import utez.edu.mx.sinv.services.storage.StorageService;

@RestController
@RequestMapping("/api/storage")
@Tag(name = "Controlador de Almacenamiento", description = "Controlador para gestionar el almacenamiento de inventario")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = {"*"})
public class StorageController {
    private final StorageService service;

    public StorageController(StorageService service) {
        this.service = service;
    }

    @GetMapping("/")
    @Operation(summary = "Traer todos los almacenes", description = "Obtiene el listado de todos los almacenes en el sistema")
    public ResponseEntity<ApiResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Traer un almacén por ID", description = "Obtiene un almacén específico por su ID")
    public ResponseEntity<ApiResponse> findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping("/")
    @Operation(summary = "Guardar un almacén", description = "Guarda un nuevo almacén en el sistema")
    public ResponseEntity<ApiResponse> save(@RequestBody StorageDto dto) {
        return service.save(dto);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un almacén", description = "Actualiza un almacén existente por su ID")
    public ResponseEntity<ApiResponse> update(
            @PathVariable Long id,
            @RequestBody StorageDto dto
    ) {
        if (!id.equals(dto.getId())) {
            return new ResponseEntity<>(
                    new ApiResponse("ID mismatch", HttpStatus.BAD_REQUEST),
                    HttpStatus.BAD_REQUEST);
        }
        return service.update(dto);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Cambiar el estado de un almacén", description = "Cambia el estado de un almacén por su ID")
    public ResponseEntity<ApiResponse> changeStatus(@PathVariable Long id) {
        return service.changeStatus(id);
    }

    @GetMapping("/responsible/{userId}")
    @Operation(summary = "Traer almacenes por responsable", description = "Obtiene los almacenes asignados a un usuario específico")
    public ResponseEntity<ApiResponse> findByResponsible(
            @PathVariable Long userId
    ) {
        return service.findByResponsible(userId);
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Traer almacenes por categoría", description = "Obtiene los almacenes asociados a una categoría específica")
    public ResponseEntity<ApiResponse> findByCategory(
            @PathVariable Long categoryId
    ) {
        return service.findByCategory(categoryId);
    }

    @PostMapping("/assign-responsible")
    @Operation(summary = "Asignar responsable a un almacén", description = "Asigna un usuario como responsable de un almacén")
    public ResponseEntity<ApiResponse> assignResponsible(
            @RequestParam Long userId,
            @RequestParam Long storageId
    ) {
        return service.assignStorageToUser(userId, storageId);
    }

}